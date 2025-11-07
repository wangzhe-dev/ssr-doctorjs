import chalk from 'chalk';
import { detectSSRIssues } from '../analyzer.js';

interface CheckOptions {
  fix?: boolean;
}

export function check(files: string[], options: CheckOptions) {
  if (files.length === 0) {
    console.log(chalk.yellow('No files specified'));
    return;
  }

  let totalIssues = 0;

  for (const file of files) {
    const issues = detectSSRIssues(file);

    if (issues.length > 0) {
      console.log(chalk.cyan(`\n${file}:`));
      for (const issue of issues) {
        console.log(
          `  ${chalk.dim(`${issue.line}:${issue.column}`)} ${chalk.red(issue.type)} - ${issue.message}`
        );
        console.log(`    ${chalk.dim(issue.code)}`);
        totalIssues++;
      }
    }
  }

  if (totalIssues === 0) {
    console.log(chalk.green('\n✓ No SSR issues found!'));
  } else {
    console.log(chalk.yellow(`\n⚠ Found ${totalIssues} SSR issue(s)`));
    if (options.fix) {
      console.log(chalk.dim('Auto-fix is not yet implemented'));
    }
  }

  process.exit(totalIssues > 0 ? 1 : 0);
}
