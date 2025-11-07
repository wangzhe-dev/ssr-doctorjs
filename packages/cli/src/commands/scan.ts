import { glob } from 'glob';
import chalk from 'chalk';
import ora from 'ora';
import { detectSSRIssues } from '../analyzer.js';

interface ScanOptions {
  path: string;
  format: 'text' | 'json';
}

export async function scan(options: ScanOptions) {
  const spinner = ora('Scanning for SSR issues...').start();

  try {
    const files = await glob(`${options.path}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
    });

    spinner.text = `Found ${files.length} files to analyze`;

    let totalIssues = 0;
    const issuesByFile = new Map();

    for (const file of files) {
      const issues = detectSSRIssues(file);
      if (issues.length > 0) {
        issuesByFile.set(file, issues);
        totalIssues += issues.length;
      }
    }

    spinner.stop();

    if (options.format === 'json') {
      console.log(JSON.stringify(Object.fromEntries(issuesByFile), null, 2));
    } else {
      if (totalIssues === 0) {
        console.log(chalk.green('✓ No SSR issues found!'));
      } else {
        console.log(chalk.yellow(`\n⚠ Found ${totalIssues} SSR issue(s) in ${issuesByFile.size} file(s):\n`));

        for (const [file, issues] of issuesByFile) {
          console.log(chalk.cyan(`\n${file}:`));
          for (const issue of issues) {
            console.log(
              `  ${chalk.dim(`${issue.line}:${issue.column}`)} ${chalk.red(issue.type)} - ${issue.message}`
            );
            console.log(`    ${chalk.dim(issue.code)}`);
          }
        }

        console.log(chalk.yellow(`\n💡 Tip: Use 'typeof window !== "undefined"' to check for browser environment\n`));
      }
    }

    process.exit(totalIssues > 0 ? 1 : 0);
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red(error));
    process.exit(1);
  }
}
