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
  .description('Sync agents and commands to .claude/ (local) or ~/.claude/ (global)')
  .option('-g, --global', 'Install to ~/.claude/ instead of current directory')
  .option('--agents', 'Sync only agents (subagents)')
  .option('--commands', 'Sync only commands (slash commands)')
  .action(async (options) => {
    // --agents 또는 --commands가 명시되지 않으면 둘 다 동기화
    const syncAgents = options.agents || (!options.agents && !options.commands);
    const syncCommands = options.commands || (!options.agents && !options.commands);

    const result = await syncSubagents({
      global: options.global || false,
      agents: syncAgents,
      commands: syncCommands
    });

    if (!result.success) {
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available agents and commands')
  .action(async () => {
    await listSubagents();
  });

// 기본 명령어가 없으면 help 표시
if (process.argv.length === 2) {
  program.help();
}

program.parse();
