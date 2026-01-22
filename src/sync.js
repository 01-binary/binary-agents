import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 모노레포의 agents, commands 디렉토리 경로
const REPO_AGENTS_DIR = path.join(__dirname, '..', 'agents');
const REPO_COMMANDS_DIR = path.join(__dirname, '..', 'commands');

/**
 * 로컬 agents 디렉토리에서 서브에이전트 파일 목록 가져오기
 */
async function fetchSubagentFiles() {
  try {
    const files = await fs.readdir(REPO_AGENTS_DIR);

    // .md 파일만 필터링
    const subagentFiles = files.filter(file => file.endsWith('.md'));

    return subagentFiles;
  } catch (error) {
    throw new Error(`Failed to read agents directory: ${error.message}`);
  }
}

/**
 * 로컬 commands 디렉토리에서 슬래시 명령어 파일 목록 가져오기
 */
async function fetchCommandFiles() {
  try {
    const files = await fs.readdir(REPO_COMMANDS_DIR);

    // .md 파일만 필터링
    const commandFiles = files.filter(file => file.endsWith('.md'));

    return commandFiles;
  } catch (error) {
    throw new Error(`Failed to read commands directory: ${error.message}`);
  }
}

/**
 * YAML frontmatter가 있는지 검증
 */
function validateYamlFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  return frontmatterRegex.test(content);
}

/**
 * 로컬에서 에이전트 파일 읽기
 */
async function readAgentFile(filename) {
  const filePath = path.join(REPO_AGENTS_DIR, filename);
  const content = await fs.readFile(filePath, 'utf-8');

  // YAML frontmatter 검증
  if (!validateYamlFrontmatter(content)) {
    throw new Error(`Invalid YAML frontmatter in ${filename}`);
  }

  return content;
}

/**
 * 로컬에서 커맨드 파일 읽기
 */
async function readCommandFile(filename) {
  const filePath = path.join(REPO_COMMANDS_DIR, filename);
  const content = await fs.readFile(filePath, 'utf-8');

  // YAML frontmatter 검증
  if (!validateYamlFrontmatter(content)) {
    throw new Error(`Invalid YAML frontmatter in ${filename}`);
  }

  return content;
}

/**
 * .claude 하위 디렉토리 생성
 * @param {string} subdir - 하위 디렉토리 이름 ('agents' 또는 'commands')
 * @param {boolean} isGlobal - true면 ~/.claude/{subdir}, false면 현재 디렉토리의 .claude/{subdir}
 */
async function ensureClaudeDirectory(subdir, isGlobal = false) {
  let targetDir;

  if (isGlobal) {
    // 전역 설치: ~/.claude/{subdir}
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    targetDir = path.join(homeDir, '.claude', subdir);
  } else {
    // 로컬 설치: 현재 디렉토리의 .claude/{subdir}
    targetDir = path.join(process.cwd(), '.claude', subdir);
  }

  try {
    await fs.access(targetDir);
  } catch {
    await fs.mkdir(targetDir, { recursive: true });
  }

  return targetDir;
}

/**
 * 파일 저장
 */
async function saveFile(agentsDir, filename, content) {
  const filePath = path.join(agentsDir, filename);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * 디렉토리 내 .md 파일 삭제
 */
async function cleanDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      await fs.unlink(path.join(dirPath, file));
    }

    return mdFiles.length;
  } catch {
    return 0;
  }
}

/**
 * 서브에이전트 동기화
 */
async function syncAgentsOnly(options = {}) {
  const { global: isGlobal = false, clean = false } = options;

  console.log(chalk.yellow.bold('\n📦 Syncing Agents...\n'));

  // 로컬 agents 디렉토리에서 파일 목록 가져오기
  const fetchSpinner = ora('Reading subagent files...').start();
  let filesToSync;

  try {
    filesToSync = await fetchSubagentFiles();
    fetchSpinner.succeed(chalk.green(`Found ${filesToSync.length} subagent files`));
  } catch (error) {
    fetchSpinner.fail(chalk.red(`Failed to read file list: ${error.message}`));
    return { success: false, error: error.message, type: 'agents' };
  }

  // .claude/agents 디렉토리 생성
  const dirMessage = isGlobal ? 'Creating ~/.claude/agents directory...' : 'Creating .claude/agents directory...';
  const dirSpinner = ora(dirMessage).start();
  let agentsDir;

  try {
    agentsDir = await ensureClaudeDirectory('agents', isGlobal);
    const successMessage = isGlobal ? 'Created ~/.claude/agents directory' : 'Created .claude/agents directory';
    dirSpinner.succeed(chalk.green(successMessage));
  } catch (error) {
    dirSpinner.fail(chalk.red(`Failed to create directory: ${error.message}`));
    return { success: false, error: error.message, type: 'agents' };
  }

  // clean 옵션이 있으면 기존 파일 삭제
  if (clean) {
    const cleanSpinner = ora('Cleaning existing agent files...').start();
    const deletedCount = await cleanDirectory(agentsDir);
    cleanSpinner.succeed(chalk.green(`Cleaned ${deletedCount} existing files`));
  }

  // 각 파일 복사
  const results = {
    success: [],
    failed: []
  };

  for (const filename of filesToSync) {
    const fileSpinner = ora(`Copying ${filename}...`).start();

    try {
      const content = await readAgentFile(filename);
      await saveFile(agentsDir, filename, content);
      fileSpinner.succeed(chalk.green(`✓ ${filename}`));
      results.success.push(filename);
    } catch (error) {
      fileSpinner.fail(chalk.red(`✗ ${filename}: ${error.message}`));
      results.failed.push({ filename, error: error.message });
    }
  }

  return {
    success: results.failed.length === 0,
    results,
    type: 'agents',
    dir: agentsDir,
    total: filesToSync.length
  };
}

/**
 * 슬래시 명령어 동기화
 */
async function syncCommandsOnly(options = {}) {
  const { global: isGlobal = false, clean = false } = options;

  console.log(chalk.yellow.bold('\n⚡ Syncing Commands...\n'));

  // 로컬 commands 디렉토리에서 파일 목록 가져오기
  const fetchSpinner = ora('Reading command files...').start();
  let allFiles;

  try {
    allFiles = await fetchCommandFiles();
    fetchSpinner.succeed(chalk.green(`Found ${allFiles.length} command files`));
  } catch (error) {
    fetchSpinner.fail(chalk.red(`Failed to read file list: ${error.message}`));
    return { success: false, error: error.message, type: 'commands' };
  }

  // .claude/commands 디렉토리 생성
  const dirMessage = isGlobal ? 'Creating ~/.claude/commands directory...' : 'Creating .claude/commands directory...';
  const dirSpinner = ora(dirMessage).start();
  let commandsDir;

  try {
    commandsDir = await ensureClaudeDirectory('commands', isGlobal);
    const successMessage = isGlobal ? 'Created ~/.claude/commands directory' : 'Created .claude/commands directory';
    dirSpinner.succeed(chalk.green(successMessage));
  } catch (error) {
    dirSpinner.fail(chalk.red(`Failed to create directory: ${error.message}`));
    return { success: false, error: error.message, type: 'commands' };
  }

  // clean 옵션이 있으면 기존 파일 삭제
  if (clean) {
    const cleanSpinner = ora('Cleaning existing command files...').start();
    const deletedCount = await cleanDirectory(commandsDir);
    cleanSpinner.succeed(chalk.green(`Cleaned ${deletedCount} existing files`));
  }

  // 각 파일 복사
  const results = {
    success: [],
    failed: []
  };

  for (const filename of allFiles) {
    const fileSpinner = ora(`Copying ${filename}...`).start();

    try {
      const content = await readCommandFile(filename);
      await saveFile(commandsDir, filename, content);
      fileSpinner.succeed(chalk.green(`✓ ${filename}`));
      results.success.push(filename);
    } catch (error) {
      fileSpinner.fail(chalk.red(`✗ ${filename}: ${error.message}`));
      results.failed.push({ filename, error: error.message });
    }
  }

  return {
    success: results.failed.length === 0,
    results,
    type: 'commands',
    dir: commandsDir,
    total: allFiles.length
  };
}

/**
 * 메인 동기화 함수
 */
export async function syncSubagents(options = {}) {
  const { global: isGlobal = false, agents = true, commands = true, clean = false } = options;

  console.log(chalk.blue.bold('\n🤖 Binary Agents Sync\n'));

  if (isGlobal) {
    console.log(chalk.cyan('📍 Global mode: Installing to ~/.claude/\n'));
  }

  if (clean) {
    console.log(chalk.yellow('🧹 Clean mode: Removing existing files before sync\n'));
  }

  const syncResults = [];

  // Agents 동기화
  if (agents) {
    const agentResult = await syncAgentsOnly({ global: isGlobal, clean });
    syncResults.push(agentResult);
  }

  // Commands 동기화
  if (commands) {
    const commandResult = await syncCommandsOnly({ global: isGlobal, clean });
    syncResults.push(commandResult);
  }

  // 결과 요약
  console.log(chalk.blue.bold('\n📊 Sync Summary\n'));

  for (const result of syncResults) {
    if (result.error) {
      console.log(chalk.red(`✗ ${result.type}: Failed - ${result.error}`));
    } else {
      const icon = result.type === 'agents' ? '🤖' : '⚡';
      console.log(chalk.green(`${icon} ${result.type}: ${result.results.success.length}/${result.total} successful`));

      if (result.results.failed.length > 0) {
        console.log(chalk.red(`   Failed files:`));
        result.results.failed.forEach(({ filename, error }) => {
          console.log(chalk.red(`     - ${filename}: ${error}`));
        });
      }

      console.log(chalk.cyan(`   📁 Location: ${result.dir}`));
    }
  }

  console.log('');

  const allSuccess = syncResults.every(r => r.success);
  return {
    success: allSuccess,
    results: syncResults
  };
}

/**
 * 사용 가능한 서브에이전트 및 명령어 목록 표시
 */
export async function listSubagents() {
  console.log(chalk.blue.bold('\n🤖 Binary Agents - Available Items\n'));

  // Agents 목록
  const agentSpinner = ora('Reading subagent files...').start();

  try {
    const agentFiles = await fetchSubagentFiles();
    agentSpinner.succeed(chalk.green(`Found ${agentFiles.length} subagent files`));

    console.log(chalk.yellow('\n📦 Agents:'));
    agentFiles.forEach(f => console.log(chalk.white(`  • ${f.replace('.md', '')}`)));
  } catch (error) {
    agentSpinner.fail(chalk.red(`Failed to read agents: ${error.message}`));
  }

  // Commands 목록
  const commandSpinner = ora('Reading command files...').start();

  try {
    const commandFiles = await fetchCommandFiles();
    commandSpinner.succeed(chalk.green(`Found ${commandFiles.length} command files`));

    console.log(chalk.yellow('\n⚡ Commands (Slash commands):'));
    commandFiles.forEach(f => console.log(chalk.white(`  • /${f.replace('.md', '')}`)));
  } catch (error) {
    commandSpinner.fail(chalk.red(`Failed to read commands: ${error.message}`));
  }

  console.log('');
}
