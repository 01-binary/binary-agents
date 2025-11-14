#!/usr/bin/env node

import { Command } from 'commander';
import { syncSubagents, listSubagents } from '../src/sync.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('binary-agents')
  .description('Sync Claude Code subagents from 01-binary/subagents repository')
  .version('1.0.0');

program
  .command('sync')
  .description('Sync subagent files to .claude/agents/ (local) or ~/.claude/agents (global)')
  .option('--basic', 'Sync only basic (Haiku) subagents')
  .option('--advanced', 'Sync only advanced (Sonnet) subagents')
  .option('-g, --global', 'Install to ~/.claude/agents instead of current directory')
  .action(async (options) => {
    let filter = null;

    if (options.basic) {
      filter = 'basic';
    } else if (options.advanced) {
      filter = 'advanced';
    }

    const result = await syncSubagents({
      filter,
      global: options.global || false
    });

    if (!result.success) {
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available subagents')
  .action(async () => {
    await listSubagents();
  });

// 기본 명령어가 없으면 help 표시
if (process.argv.length === 2) {
  program.help();
}

program.parse();
