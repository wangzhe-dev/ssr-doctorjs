#!/usr/bin/env node

import { Command } from 'commander';
import { scan } from './commands/scan.js';
import { check } from './commands/check.js';

const program = new Command();

program
  .name('ssr-doctor')
  .description('CLI tool for detecting SSR compatibility issues in React and Next.js applications')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan your codebase for SSR compatibility issues')
  .option('-p, --path <path>', 'Path to scan (default: ./src)', './src')
  .option('-f, --format <format>', 'Output format: text, json, markdown, sarif (default: text)', 'text')
  .option('-o, --out <file>', 'Write output to file instead of stdout')
  .option('-s, --strict', 'Fail on warnings in addition to errors (default: false)', false)
  .option('-i, --ignore <patterns...>', 'Glob patterns to ignore (e.g., "**/*.test.tsx")')
  .option('-v, --verbose', 'Show detailed information including code snippets (default: false)', false)
  .action((options) => {
    scan({
      path: options.path,
      format: options.format,
      out: options.out,
      strict: options.strict,
      ignore: options.ignore || [],
      verbose: options.verbose,
    });
  });

program
  .command('check')
  .description('Check specific files for SSR compatibility issues')
  .argument('[files...]', 'Files to check (e.g., src/App.tsx src/utils/dom.ts)')
  .option('--fix', 'Attempt to fix issues automatically (coming soon)')
  .option('-v, --verbose', 'Show detailed information including code snippets', false)
  .option('-f, --format <format>', 'Output format: text or json (default: text)', 'text')
  .action((files, options) => {
    check(files, {
      fix: options.fix,
      verbose: options.verbose,
      format: options.format,
    });
  });

program.parse();
