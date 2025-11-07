import { glob } from 'glob';
import ora from 'ora';
import { writeFileSync } from 'fs';
import { detectSSRIssues, getIssueStats } from '../analyzer.js';
import { formatText, formatJSON, formatMarkdown, formatSARIF } from '../formatters.js';
import type { SSRIssue } from '../analyzer.js';

export interface ScanOptions {
  path: string;
  format: 'text' | 'json' | 'markdown' | 'sarif';
  out?: string;
  strict?: boolean;
  ignore?: string[];
  verbose?: boolean;
}

export async function scan(options: ScanOptions) {
  const spinner = ora('Scanning for SSR issues...').start();

  try {
    // Build ignore patterns
    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/*.test.*', '**/*.spec.*'];
    const ignorePatterns = [...defaultIgnore, ...(options.ignore || [])];

    // Find files
    const files = await glob(`${options.path}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ignorePatterns,
    });

    spinner.text = `Found ${files.length} files to analyze`;

    // Analyze files
    const issuesByFile = new Map<string, SSRIssue[]>();
    let allIssues: SSRIssue[] = [];

    for (const file of files) {
      const issues = detectSSRIssues(file);
      if (issues.length > 0) {
        issuesByFile.set(file, issues);
        allIssues = allIssues.concat(issues);
      }
    }

    spinner.stop();

    // Get statistics
    const stats = getIssueStats(allIssues);

    // Format output
    let output: string;
    switch (options.format) {
      case 'json':
        output = formatJSON(issuesByFile, { verbose: options.verbose });
        break;
      case 'markdown':
        output = formatMarkdown(issuesByFile, { verbose: options.verbose });
        break;
      case 'sarif':
        output = formatSARIF(issuesByFile, { verbose: options.verbose });
        break;
      case 'text':
      default:
        output = formatText(issuesByFile, { verbose: options.verbose });
        break;
    }

    // Write to file or stdout
    if (options.out) {
      writeFileSync(options.out, output, 'utf-8');
      console.log(`\n✓ Report written to ${options.out}`);
    } else {
      console.log(output);
    }

    // Exit with appropriate code
    if (stats.total === 0) {
      process.exit(0);
    }

    // Strict mode: fail on warnings too
    if (options.strict && stats.warnings > 0) {
      process.exit(1);
    }

    // Normal mode: fail only on errors
    if (stats.errors > 0) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(error);
    process.exit(1);
  }
}
