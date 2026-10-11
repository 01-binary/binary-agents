import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 모노레포의 agents, commands, skills 디렉토리 경로
const REPO_AGENTS_DIR = path.join(__dirname, '..', 'agents');
const REPO_COMMANDS_DIR = path.join(__dirname, '..', 'commands');
const REPO_SKILLS_DIR = path.join(__dirname, '..', 'skills');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

// 설치 기록 파일 (.claude 폴더 안). 다음 설치 때 패키지에서 빠진 파일을 찾아 지우는 데 쓴다
const MANIFEST_FILENAME = '.binary-agents-manifest.json';

// 설치 기록을 남기지 않던 1.x 버전이 설치할 수 있었던 모든 파일 이름 (git 이력 기준)
// 설치 기록이 없는 예전 설치에서도, 이 중 지금 패키지에 없는 이름은 지운다.
// 앞으로 파일을 지울 때는 설치 기록이 처리하므로 이 목록은 고칠 필요가 없다.
const PRE_MANIFEST_FILES = {
  agents: [
    'advanced-code-reviewer.md',
    'advanced-junior-checker.md',
    'advanced-refactor-analyzer.md',
    'code-reviewer.md',
    'figma-implementation-checker.md',
    'fundamentals-code.md',
    'fundamentals-cohesion.md',
    'fundamentals-coupling.md',
    'fundamentals-predictability.md',
    'fundamentals-readability.md',
    'junior-checker.md',
    'junior-friendly-checker.md',
    'maintainable-code-reviewer.md',
    'react-performance-optimizer.md',
    'react-principles-reviewer.md',
    'react-state-reviewer.md',
    'refactor-analyzer.md',
    'subagent-builder.md',
    'toss-cohesion-analyzer.md'
  ],
  commands: [
    'branch.md',
    'code-review.md',
    'commit.md',
    'design-to-code.md',
    'figma-check.md',
    'fundamentals-review.md',
    'impact-check.md',
    'pr.md',
    'review-comments.md',
    'review-pr.md'
  ],
  skills: []
};

/**
 * 설치 대상 .claude 폴더 경로
 */
function getClaudeRoot(isGlobal) {
  if (isGlobal) {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    return path.join(homeDir, '.claude');
  }
  return path.join(process.cwd(), '.claude');
}

/**
 * 패키지 버전 읽기
 */
export async function getPackageVersion() {
  const raw = await fs.readFile(PACKAGE_JSON_PATH, 'utf-8');
  return JSON.parse(raw).version;
}

/**
 * 이전 설치 기록 읽기 (없으면 빈 기록)
 */
async function readManifest(claudeRoot) {
  try {
    const raw = await fs.readFile(path.join(claudeRoot, MANIFEST_FILENAME), 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version ?? null,
      agents: parsed.agents ?? [],
      commands: parsed.commands ?? [],
      skills: parsed.skills ?? []
    };
  } catch {
    return { version: null, agents: [], commands: [], skills: [] };
  }
}

/**
 * 설치 기록 저장
 */
async function writeManifest(claudeRoot, manifest) {
  await fs.mkdir(claudeRoot, { recursive: true });
  const content = { ...manifest, updatedAt: new Date().toISOString() };
  await fs.writeFile(path.join(claudeRoot, MANIFEST_FILENAME), `${JSON.stringify(content, null, 2)}\n`, 'utf-8');
}

/**
 * 예전에 설치했지만 지금 패키지에는 없는 이름 찾기
 * @param {'agents'|'commands'|'skills'} type
 * @param {string[]} currentNames - 지금 패키지에 있는 이름
 * @param {object} previousManifest - 이전 설치 기록
 */
function findObsoleteNames(type, currentNames, previousManifest) {
  const candidates = new Set([...previousManifest[type], ...PRE_MANIFEST_FILES[type]]);
  return [...candidates].filter(name => !currentNames.includes(name));
}

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
 * 로컬 skills 디렉토리에서 스킬 폴더 목록 가져오기 (SKILL.md가 있는 폴더만)
 */
async function fetchSkillDirs() {
  try {
    const entries = await fs.readdir(REPO_SKILLS_DIR, { withFileTypes: true });
    const skillDirs = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        await fs.access(path.join(REPO_SKILLS_DIR, entry.name, 'SKILL.md'));
        skillDirs.push(entry.name);
      } catch {
        // SKILL.md가 없는 폴더는 스킬이 아니므로 건너뜀
      }
    }

    return skillDirs;
  } catch (error) {
    throw new Error(`Failed to read skills directory: ${error.message}`);
  }
}

/**
 * 폴더를 하위 파일까지 그대로 복사
 */
async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
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
 * @param {string} subdir - 하위 디렉토리 이름 ('agents', 'commands', 'skills')
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
 * binary-agents로 설치된 파일만 삭제
 * @param {string} dirPath - 대상 디렉토리
 * @param {string[]} targetFiles - 삭제할 파일명 목록
 */
async function cleanDirectory(dirPath, targetFiles) {
  try {
    const existingFiles = await fs.readdir(dirPath);
    const filesToDelete = existingFiles.filter(f => targetFiles.includes(f));

    for (const file of filesToDelete) {
      await fs.unlink(path.join(dirPath, file));
    }

    return filesToDelete.length;
  } catch {
    return 0;
  }
}

/**
 * binary-agents로 설치된 스킬 폴더만 삭제
 * @param {string} dirPath - 대상 디렉토리 (.claude/skills)
 * @param {string[]} targetDirs - 삭제할 스킬 폴더명 목록
 */
async function cleanSkillDirectories(dirPath, targetDirs) {
  let deletedCount = 0;

  for (const dirName of targetDirs) {
    const targetPath = path.join(dirPath, dirName);
    try {
      await fs.access(targetPath);
    } catch {
      continue;
    }
    await fs.rm(targetPath, { recursive: true, force: true });
    deletedCount++;
  }

  return deletedCount;
}

/**
 * 서브에이전트 동기화
 */
async function syncAgentsOnly(options = {}) {
  const { global: isGlobal = false, clean = false, previousManifest } = options;

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

  // clean 옵션이 있으면 binary-agents 파일만 삭제 (패키지에서 빠진 예전 파일 포함)
  if (clean) {
    const cleanSpinner = ora('Cleaning binary-agents files...').start();
    const deletedCount = await cleanDirectory(agentsDir, filesToSync);
    const removedCount = await cleanDirectory(agentsDir, findObsoleteNames('agents', filesToSync, previousManifest));
    cleanSpinner.succeed(chalk.green(`Cleaned ${deletedCount} binary-agents files, removed ${removedCount} files no longer in binary-agents`));
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
  const { global: isGlobal = false, clean = false, previousManifest } = options;

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

  // clean 옵션이 있으면 binary-agents 파일만 삭제
  if (clean) {
    const cleanSpinner = ora('Cleaning binary-agents files...').start();
    const deletedCount = await cleanDirectory(commandsDir, allFiles);
    const removedCount = await cleanDirectory(commandsDir, findObsoleteNames('commands', allFiles, previousManifest));
    cleanSpinner.succeed(chalk.green(`Cleaned ${deletedCount} binary-agents files, removed ${removedCount} files no longer in binary-agents`));
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
 * 스킬 동기화 (스킬은 SKILL.md와 부속 파일이 든 폴더 단위로 복사)
 */
async function syncSkillsOnly(options = {}) {
  const { global: isGlobal = false, clean = false, previousManifest } = options;

  console.log(chalk.yellow.bold('\n📚 Syncing Skills...\n'));

  // 로컬 skills 디렉토리에서 스킬 폴더 목록 가져오기
  const fetchSpinner = ora('Reading skill directories...').start();
  let skillDirs;

  try {
    skillDirs = await fetchSkillDirs();
    fetchSpinner.succeed(chalk.green(`Found ${skillDirs.length} skills`));
  } catch (error) {
    fetchSpinner.fail(chalk.red(`Failed to read skill list: ${error.message}`));
    return { success: false, error: error.message, type: 'skills' };
  }

  // .claude/skills 디렉토리 생성
  const dirMessage = isGlobal ? 'Creating ~/.claude/skills directory...' : 'Creating .claude/skills directory...';
  const dirSpinner = ora(dirMessage).start();
  let skillsDir;

  try {
    skillsDir = await ensureClaudeDirectory('skills', isGlobal);
    const successMessage = isGlobal ? 'Created ~/.claude/skills directory' : 'Created .claude/skills directory';
    dirSpinner.succeed(chalk.green(successMessage));
  } catch (error) {
    dirSpinner.fail(chalk.red(`Failed to create directory: ${error.message}`));
    return { success: false, error: error.message, type: 'skills' };
  }

  // clean 옵션이 있으면 binary-agents 스킬 폴더만 삭제
  if (clean) {
    const cleanSpinner = ora('Cleaning binary-agents skills...').start();
    const deletedCount = await cleanSkillDirectories(skillsDir, skillDirs);
    const removedCount = await cleanSkillDirectories(skillsDir, findObsoleteNames('skills', skillDirs, previousManifest));
    cleanSpinner.succeed(chalk.green(`Cleaned ${deletedCount} binary-agents skills, removed ${removedCount} skills no longer in binary-agents`));
  }

  // 각 스킬 폴더 복사
  const results = {
    success: [],
    failed: []
  };

  for (const skillName of skillDirs) {
    const skillSpinner = ora(`Copying ${skillName}/...`).start();

    try {
      const sourceDir = path.join(REPO_SKILLS_DIR, skillName);
      const content = await fs.readFile(path.join(sourceDir, 'SKILL.md'), 'utf-8');

      // YAML frontmatter 검증
      if (!validateYamlFrontmatter(content)) {
        throw new Error(`Invalid YAML frontmatter in ${skillName}/SKILL.md`);
      }

      await copyDirectory(sourceDir, path.join(skillsDir, skillName));
      skillSpinner.succeed(chalk.green(`✓ ${skillName}/`));
      results.success.push(skillName);
    } catch (error) {
      skillSpinner.fail(chalk.red(`✗ ${skillName}: ${error.message}`));
      results.failed.push({ filename: skillName, error: error.message });
    }
  }

  return {
    success: results.failed.length === 0,
    results,
    type: 'skills',
    dir: skillsDir,
    total: skillDirs.length
  };
}

/**
 * 메인 동기화 함수
 */
export async function syncSubagents(options = {}) {
  const { global: isGlobal = false, agents = true, commands = true, skills = true, clean = false } = options;

  console.log(chalk.blue.bold('\n🤖 Binary Agents Sync\n'));

  if (isGlobal) {
    console.log(chalk.cyan('📍 Global mode: Installing to ~/.claude/\n'));
  }

  if (clean) {
    console.log(chalk.yellow('🧹 Clean mode: binary-agents로 설치한 파일만 삭제 (커스텀 파일 보존)\n'));
  }

  const claudeRoot = getClaudeRoot(isGlobal);
  const previousManifest = await readManifest(claudeRoot);
  const packageVersion = await getPackageVersion();
  const syncOptions = { global: isGlobal, clean, previousManifest };

  const syncResults = [];

  // Agents 동기화
  if (agents) {
    const agentResult = await syncAgentsOnly(syncOptions);
    syncResults.push(agentResult);
  }

  // Commands 동기화
  if (commands) {
    const commandResult = await syncCommandsOnly(syncOptions);
    syncResults.push(commandResult);
  }

  // Skills 동기화
  if (skills) {
    const skillResult = await syncSkillsOnly(syncOptions);
    syncResults.push(skillResult);
  }

  // 설치 기록 갱신: 이번에 설치한 종류만 바꾸고, 나머지 종류는 이전 기록을 유지
  // clean이 아니면 지우지 못한 예전 파일을 다음 정리 때 찾을 수 있게 기록에 남긴다
  const nextManifest = { ...previousManifest, version: packageVersion };
  for (const result of syncResults) {
    if (!result.results) continue;
    nextManifest[result.type] = clean
      ? result.results.success
      : [...new Set([...result.results.success, ...previousManifest[result.type]])];
  }
  await writeManifest(claudeRoot, nextManifest);

  // 결과 요약
  console.log(chalk.blue.bold('\n📊 Sync Summary\n'));

  for (const result of syncResults) {
    if (result.error) {
      console.log(chalk.red(`✗ ${result.type}: Failed - ${result.error}`));
    } else {
      const icon = { agents: '🤖', commands: '⚡', skills: '📚' }[result.type];
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

  const versionMessage = previousManifest.version && previousManifest.version !== packageVersion
    ? `${previousManifest.version} → ${packageVersion}`
    : packageVersion;
  console.log(chalk.cyan(`📌 Installed version: ${versionMessage}`));
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

  // Skills 목록
  const skillSpinner = ora('Reading skill directories...').start();

  try {
    const skillDirs = await fetchSkillDirs();
    skillSpinner.succeed(chalk.green(`Found ${skillDirs.length} skills`));

    console.log(chalk.yellow('\n📚 Skills:'));
    skillDirs.forEach(name => console.log(chalk.white(`  • ${name}`)));
  } catch (error) {
    skillSpinner.fail(chalk.red(`Failed to read skills: ${error.message}`));
  }

  console.log('');
}
