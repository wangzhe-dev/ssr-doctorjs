import { glob } from 'glob';
import ora from 'ora';
import { writeFileSync } from 'fs';
import { detectSSRIssues, getIssueStats, type SSRIssue } from '@ssr-doctor/core';
import { formatText, formatJSON, formatMarkdown, formatSARIF } from '../formatters.js';
import { loadConfig, mergeWithCLI, validateConfig } from '../config.js';

export interface ScanOptions {
  path: string;
  format?: 'text' | 'json' | 'markdown' | 'sarif';
  out?: string;
  strict?: boolean;
  ignore?: string[];
  verbose?: boolean;
  config?: string;
}

export async function scan(options: ScanOptions) {
  // Load and merge configuration
  const config = loadConfig(options.config);
  const finalOptions = mergeWithCLI(config, options);

  // Validate configuration
  const errors = validateConfig(finalOptions);
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  const spinner = ora('Scanning for SSR issues...').start();

  try {
    // Use ignore patterns from merged config
    const ignorePatterns = finalOptions.ignore || [];

    // Find files
    const files = await glob(`${options.path}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ignorePatterns,
    });

    spinner.text = `Found ${files.length} files to analyze`;

    // Analyze files
    const issuesByFile = new Map<string, SSRIssue[]>();
    let allIssues: SSRIssue[] = [];
    const fileErrors: Array<{ file: string; error: string }> = [];

    for (const file of files) {
      const issues = detectSSRIssues(file, {
        onError: (filePath, error) => {
          fileErrors.push({ file: filePath, error: error.message });
          if (finalOptions.verbose) {
            spinner.warn(`Failed to analyze ${filePath}: ${error.message}`);
          }
        },
      });
      if (issues.length > 0) {
        issuesByFile.set(file, issues);
        allIssues = allIssues.concat(issues);
      }
    }

    spinner.stop();

    // Report errors if any occurred
    if (fileErrors.length > 0 && finalOptions.verbose) {
      console.warn(`\n⚠️  ${fileErrors.length} file(s) could not be analyzed:`);
      fileErrors.forEach(({ file, error }) => {
        console.warn(`   - ${file}: ${error}`);
      });
    }

    // Get statistics
    const stats = getIssueStats(allIssues);

    // Format output
    let output: string;
    const format = finalOptions.format || 'text';
    switch (format) {
      case 'json':
        output = formatJSON(issuesByFile, { verbose: finalOptions.verbose });
        break;
      case 'markdown':
        output = formatMarkdown(issuesByFile, { verbose: finalOptions.verbose });
        break;
      case 'sarif':
        output = formatSARIF(issuesByFile, { verbose: finalOptions.verbose });
        break;
      case 'text':
      default:
        output = formatText(issuesByFile, { verbose: finalOptions.verbose });
        break;
    }

    // Write to file or stdout
    const outputFile = finalOptions.output || finalOptions.out;
    if (outputFile) {
      writeFileSync(outputFile, output, 'utf-8');
      console.log(`\n✓ Report written to ${outputFile}`);
    } else {
      console.log(output);
    }

    // Exit with appropriate code
    if (stats.total === 0) {
      process.exit(0);
    }

    // Strict mode: fail on warnings too
    if (finalOptions.strict && stats.warnings > 0) {
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
