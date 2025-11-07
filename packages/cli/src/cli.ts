#!/usr/bin/env node

import { Command } from 'commander';
import { scan } from './commands/scan.js';
import { check } from './commands/check.js';

const program = new Command();

program
  .name('ssr-doctor')
  .description('CLI tool for detecting SSR compatibility issues')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan your codebase for SSR issues')
  .option('-p, --path <path>', 'Path to scan', './src')
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .action(scan);

program
  .command('check')
  .description('Check specific files for SSR issues')
  .argument('[files...]', 'Files to check')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(check);

program.parse();
