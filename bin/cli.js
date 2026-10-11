#!/usr/bin/env node

import { select } from '@inquirer/prompts';
import { syncSubagents, listSubagents, getPackageVersion } from '../src/sync.js';
import chalk from 'chalk';

const REGISTRY_LATEST_URL = 'https://registry.npmjs.org/binary-agents/latest';
const VERSION_CHECK_TIMEOUT_MS = 2500;

async function main() {
  const args = process.argv.slice(2);

  // list 명령어는 바로 실행
  if (args[0] === 'list') {
    await listSubagents();
    return;
  }

  // help 또는 --help
  if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  // 대화형 설치 시작
  console.log(chalk.blue.bold('\n🤖 Binary Agents 설치\n'));
  await warnIfOutdated();

  try {
    // 1. 설치 위치 선택
    const location = await select({
      message: '어디에 설치하시겠습니까?',
      choices: [
        { name: '전역 (~/.claude/)', value: 'global' },
        { name: '현재 프로젝트 (.claude/)', value: 'local' }
      ]
    });

    // 2. 설치 항목 선택
    const items = await select({
      message: '무엇을 설치하시겠습니까?',
      choices: [
        { name: '모두 (에이전트 + 명령어 + 스킬)', value: 'all' },
        { name: '에이전트만 (에이전트가 쓰는 스킬 포함)', value: 'agents' },
        { name: '명령어만', value: 'commands' },
        { name: '스킬만', value: 'skills' }
      ]
    });

    // 옵션 구성
    const options = {
      global: location === 'global',
      agents: items === 'all' || items === 'agents',
      commands: items === 'all' || items === 'commands',
      // 에이전트가 frontmatter의 skills로 스킬을 미리 불러오므로 에이전트 설치 시 함께 설치
      skills: items === 'all' || items === 'agents' || items === 'skills',
      // 항상 패키지 내용과 똑같이 맞춘다: binary-agents 파일은 새로 쓰고, 패키지에서 빠진 파일은 지운다 (커스텀 파일은 보존)
      clean: true
    };

    // 동기화 실행
    const result = await syncSubagents(options);

    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    // Ctrl+C로 취소한 경우
    if (error.name === 'ExitPromptError') {
      console.log(chalk.yellow('\n\n취소되었습니다.\n'));
      process.exit(0);
    }
    throw error;
  }
}

/**
 * npx 캐시 때문에 예전 버전으로 실행 중이면 경고 (네트워크 실패는 무시)
 */
async function warnIfOutdated() {
  try {
    const currentVersion = await getPackageVersion();
    const response = await fetch(REGISTRY_LATEST_URL, { signal: AbortSignal.timeout(VERSION_CHECK_TIMEOUT_MS) });
    if (!response.ok) return;

    const { version: latestVersion } = await response.json();
    if (isNewerVersion(latestVersion, currentVersion)) {
      console.log(chalk.yellow(`⚠️  지금 실행 중인 버전(${currentVersion})이 최신(${latestVersion})보다 낮습니다.`));
      console.log(chalk.yellow('   최신 버전으로 설치하려면 npx binary-agents@latest 로 실행하세요.\n'));
    }
  } catch {
    // 오프라인 등으로 확인하지 못하면 그냥 진행
  }
}

/**
 * a가 b보다 새 버전인지 (major.minor.patch 숫자 비교)
 */
function isNewerVersion(a, b) {
  const parse = (version) => version.split('-')[0].split('.').map(Number);
  const [left, right] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) {
    if ((left[i] ?? 0) !== (right[i] ?? 0)) return (left[i] ?? 0) > (right[i] ?? 0);
  }
  return false;
}

function showHelp() {
  console.log(chalk.blue.bold('\n🤖 Binary Agents\n'));
  console.log('Claude Code 서브에이전트, 슬래시 명령어, 스킬 설치 도구\n');
  console.log(chalk.yellow('사용법:'));
  console.log('  npx binary-agents@latest        최신 버전으로 대화형 설치 (권장)');
  console.log('  npx binary-agents@latest list   사용 가능한 에이전트/명령어/스킬 목록');
  console.log('  npx binary-agents help          도움말 표시\n');
  console.log('설치할 때마다 패키지 내용과 똑같이 맞춥니다. 패키지에서 빠진 파일은 지우고, 직접 만든 파일은 그대로 둡니다.\n');
}

main().catch(error => {
  console.error(chalk.red(`\n오류: ${error.message}\n`));
  process.exit(1);
});
