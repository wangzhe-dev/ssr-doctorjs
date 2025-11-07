import chalk from 'chalk';
import { detectSSRIssues, getIssueStats } from '../analyzer.js';
import type { SSRIssue } from '../analyzer.js';

export interface CheckOptions {
  fix?: boolean;
  verbose?: boolean;
  format?: 'text' | 'json';
}

export async function check(files: string[], options: CheckOptions = {}) {
  if (files.length === 0) {
    console.log(chalk.yellow('⚠️  No files specified'));
    console.log(chalk.dim('\nUsage: ssr-doctor check <file1> <file2> ...'));
    console.log(chalk.dim('Example: ssr-doctor check src/components/Header.tsx'));
    process.exit(1);
  }

  // Collect all issues
  const issuesByFile = new Map<string, SSRIssue[]>();
  const allIssues: SSRIssue[] = [];

  for (const file of files) {
    try {
      const issues = detectSSRIssues(file);
      if (issues.length > 0) {
        issuesByFile.set(file, issues);
        allIssues.push(...issues);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error checking ${file}:`), error);
    }
  }

  // Get statistics
  const stats = getIssueStats(allIssues);

  // Output results
  if (options.format === 'json') {
    // JSON output
    console.log(JSON.stringify({
      summary: stats,
      issues: Object.fromEntries(issuesByFile)
    }, null, 2));
  } else {
    // Text output
    if (stats.total === 0) {
      console.log(chalk.green('\n✅ No SSR compatibility issues found!'));
      console.log(chalk.dim(`\nChecked ${files.length} file(s)\n`));
    } else {
      // Summary
      console.log(chalk.yellow(`\n⚠️  Found ${stats.total} SSR issue(s) in ${stats.files} file(s)`));
      console.log(chalk.dim(`   ${stats.errors} error(s), ${stats.warnings} warning(s)\n`));

      // Issues by file
      for (const [file, issues] of issuesByFile) {
        console.log(chalk.cyan(`\n📄 ${file}:`));

        for (const issue of issues) {
          const severityIcon = issue.severity === 'error' ? chalk.red('✗') : chalk.yellow('⚠');
          const location = chalk.dim(`${issue.line}:${issue.column}`);
          const apiName = chalk.bold(issue.api);

          console.log(`  ${severityIcon} ${location} ${apiName} - ${issue.message}`);

          if (options.verbose) {
            console.log(chalk.dim(`     ${issue.code}`));
            if (issue.suggestion) {
              console.log(chalk.blue(`     💡 ${issue.suggestion}`));
            }
          }
        }
      }

      // Tips
      if (!options.verbose) {
        console.log(chalk.dim('\n💡 Tip: Use --verbose to see code snippets and suggestions'));
      }

      // Fix message
      if (options.fix) {
        console.log(chalk.dim('\n🔧 Auto-fix is not yet implemented'));
        console.log(chalk.dim('   Coming soon: automatic fixes for common issues'));
      }

      console.log('');
    }
  }

  // Exit with appropriate code
  process.exit(stats.errors > 0 ? 1 : 0);
}
