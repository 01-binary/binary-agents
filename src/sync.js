import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 모노레포의 agents 디렉토리 경로
const REPO_AGENTS_DIR = path.join(__dirname, '..', 'agents');

/**
 * 로컬 agents 디렉토리에서 서브에이전트 파일 목록 가져오기
 */
async function fetchSubagentFiles() {
  try {
    const files = await fs.readdir(REPO_AGENTS_DIR);

    // .md 파일만 필터링 (서브에이전트 파일들)
    const subagentFiles = files.filter(file =>
      file.endsWith('.md') &&
      file.includes('-')  // 하이픈이 있는 파일만 (서브에이전트 파일들)
    );

    return subagentFiles;
  } catch (error) {
    throw new Error(`Failed to read agents directory: ${error.message}`);
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
 * 로컬에서 파일 읽기
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
 * .claude/agents 디렉토리 생성
 * @param {boolean} isGlobal - true면 ~/.claude/agents, false면 현재 디렉토리의 .claude/agents
 */
async function ensureAgentsDirectory(isGlobal = false) {
  let agentsDir;

  if (isGlobal) {
    // 전역 설치: ~/.claude/agents
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    agentsDir = path.join(homeDir, '.claude', 'agents');
  } else {
    // 로컬 설치: 현재 디렉토리의 .claude/agents
    agentsDir = path.join(process.cwd(), '.claude', 'agents');
  }

  try {
    await fs.access(agentsDir);
  } catch {
    await fs.mkdir(agentsDir, { recursive: true });
  }

  return agentsDir;
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
 * 서브에이전트 동기화 메인 함수
 */
export async function syncSubagents(options = {}) {
  const { filter = null, global = false } = options;

  console.log(chalk.blue.bold('\n🤖 Binary Agents Sync\n'));

  if (global) {
    console.log(chalk.cyan('📍 Global mode: Installing to ~/.claude/agents\n'));
  }

  // 로컬 agents 디렉토리에서 파일 목록 가져오기
  const fetchSpinner = ora('Reading subagent files from local repository...').start();
  let allFiles;

  try {
    allFiles = await fetchSubagentFiles();
    fetchSpinner.succeed(chalk.green(`Found ${allFiles.length} subagent files`));
  } catch (error) {
    fetchSpinner.fail(chalk.red(`Failed to read file list: ${error.message}`));
    return { success: false, error: error.message };
  }

  // 필터링된 파일 목록
  let filesToSync = allFiles;

  if (filter === 'basic') {
    filesToSync = allFiles.filter(f => !f.startsWith('advanced-'));
    console.log(chalk.yellow(`📌 Syncing basic subagents only (${filesToSync.length} files)\n`));
  } else if (filter === 'advanced') {
    filesToSync = allFiles.filter(f => f.startsWith('advanced-'));
    console.log(chalk.yellow(`📌 Syncing advanced subagents only (${filesToSync.length} files)\n`));
  }

  // .claude/agents 디렉토리 생성
  const dirMessage = global ? 'Creating ~/.claude/agents directory...' : 'Creating .claude/agents directory...';
  const dirSpinner = ora(dirMessage).start();
  let agentsDir;

  try {
    agentsDir = await ensureAgentsDirectory(global);
    const successMessage = global ? 'Created ~/.claude/agents directory' : 'Created .claude/agents directory';
    dirSpinner.succeed(chalk.green(successMessage));
  } catch (error) {
    dirSpinner.fail(chalk.red(`Failed to create directory: ${error.message}`));
    return { success: false, error: error.message };
  }

  // 각 파일 복사
  const results = {
    success: [],
    failed: []
  };

  for (const filename of filesToSync) {
    const fileSpinner = ora(`Copying ${filename}...`).start();

    try {
      // 로컬 파일 읽기
      const content = await readAgentFile(filename);

      // 저장
      const filePath = await saveFile(agentsDir, filename, content);

      fileSpinner.succeed(chalk.green(`✓ ${filename}`));
      results.success.push(filename);
    } catch (error) {
      fileSpinner.fail(chalk.red(`✗ ${filename}: ${error.message}`));
      results.failed.push({ filename, error: error.message });
    }
  }

  // 결과 요약
  console.log(chalk.blue.bold('\n📊 Sync Summary\n'));
  console.log(chalk.green(`✓ Successful: ${results.success.length}/${filesToSync.length}`));

  if (results.failed.length > 0) {
    console.log(chalk.red(`✗ Failed: ${results.failed.length}/${filesToSync.length}`));
    console.log(chalk.red('\nFailed files:'));
    results.failed.forEach(({ filename, error }) => {
      console.log(chalk.red(`  - ${filename}: ${error}`));
    });
  }

  console.log(chalk.cyan(`\n📁 Location: ${agentsDir}\n`));

  return {
    success: results.failed.length === 0,
    results
  };
}

/**
 * 사용 가능한 서브에이전트 목록 표시
 */
export async function listSubagents() {
  console.log(chalk.blue.bold('\n🤖 Available Subagents\n'));

  const spinner = ora('Reading subagent files from local repository...').start();

  try {
    const files = await fetchSubagentFiles();
    spinner.succeed(chalk.green('Found subagent files'));

    const basic = files.filter(f => !f.startsWith('advanced-'));
    const advanced = files.filter(f => f.startsWith('advanced-'));

    console.log(chalk.yellow('\nBasic (Haiku model):'));
    basic.forEach(f => console.log(chalk.white(`  • ${f}`)));

    console.log(chalk.yellow('\nAdvanced (Sonnet model):'));
    advanced.forEach(f => console.log(chalk.white(`  • ${f}`)));

    console.log(chalk.cyan(`\nTotal: ${files.length} subagents\n`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to read file list: ${error.message}`));
  }
}
