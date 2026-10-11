#!/usr/bin/env node

import { select } from '@inquirer/prompts';
import { syncSubagents, listSubagents } from '../src/sync.js';
import chalk from 'chalk';

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

    // 3. 기존 파일 삭제 여부
    const clean = await select({
      message: '기존 binary-agents 파일을 삭제하고 새로 설치할까요?',
      choices: [
        { name: '예 (binary-agents 파일만 삭제, 커스텀 파일 보존)', value: true },
        { name: '아니오 (기존 파일 유지)', value: false }
      ]
    });

    // 옵션 구성
    const options = {
      global: location === 'global',
      agents: items === 'all' || items === 'agents',
      commands: items === 'all' || items === 'commands',
      // 에이전트가 frontmatter의 skills로 스킬을 미리 불러오므로 에이전트 설치 시 함께 설치
      skills: items === 'all' || items === 'agents' || items === 'skills',
      clean
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

function showHelp() {
  console.log(chalk.blue.bold('\n🤖 Binary Agents\n'));
  console.log('Claude Code 서브에이전트, 슬래시 명령어, 스킬 설치 도구\n');
  console.log(chalk.yellow('사용법:'));
  console.log('  npx binary-agents        대화형 설치');
  console.log('  npx binary-agents list   사용 가능한 에이전트/명령어/스킬 목록');
  console.log('  npx binary-agents help   도움말 표시\n');
}

main().catch(error => {
  console.error(chalk.red(`\n오류: ${error.message}\n`));
  process.exit(1);
});
