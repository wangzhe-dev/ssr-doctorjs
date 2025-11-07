import * as core from '@actions/core';
import { glob } from 'glob';
import { detectSSRIssues, getIssueStats, type SSRIssue } from '@ssr-doctor/core';
import { formatMarkdown, formatSARIF } from './formatters.js';

async function run(): Promise<void> {
  try {
    // Get inputs
    const path = core.getInput('path') || './src';
    const format = core.getInput('format') || 'text';
    const failOnError = core.getInput('fail-on-error') !== 'false'; // Default true
    const strict = core.getInput('strict') === 'true'; // Default false
    const ignoreInput = core.getInput('ignore');

    core.info(`🔍 Scanning ${path} for SSR compatibility issues...`);

    // Build ignore patterns
    const defaultIgnore = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/*.test.*',
      '**/*.spec.*',
    ];

    const ignorePatterns = ignoreInput
      ? [...defaultIgnore, ...ignoreInput.split(',').map((p) => p.trim())]
      : defaultIgnore;

    // Find files
    const files = await glob(`${path}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ignorePatterns,
    });

    core.info(`Found ${files.length} files to analyze`);

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

    // Get statistics
    const stats = getIssueStats(allIssues);

    // Set outputs
    core.setOutput('issues-found', stats.total.toString());
    core.setOutput('has-errors', stats.errors > 0 ? 'true' : 'false');

    // Format and output results
    if (format === 'json') {
      const results = {
        summary: stats,
        issues: Object.fromEntries(issuesByFile),
      };
      core.setOutput('results', JSON.stringify(results));
      core.info(JSON.stringify(results, null, 2));
    } else if (format === 'markdown') {
      const markdown = formatMarkdown(issuesByFile);
      core.setOutput('results', markdown);
      core.info(markdown);
    } else if (format === 'sarif') {
      const sarif = formatSARIF(issuesByFile);
      core.setOutput('results', sarif);
      core.info(sarif);
    }

    // Report results
    if (stats.total === 0) {
      core.info('✅ No SSR compatibility issues found!');
    } else {
      // Create summary
      core.summary
        .addHeading('⚠️ SSR Doctor Report')
        .addTable([
          [
            { data: 'Metric', header: true },
            { data: 'Count', header: true },
          ],
          ['Total Issues', stats.total.toString()],
          ['Errors', stats.errors.toString()],
          ['Warnings', stats.warnings.toString()],
          ['Files', stats.files.toString()],
        ])
        .addBreak()
        .addHeading('Issues by Type', 3)
        .addTable([
          [
            { data: 'Type', header: true },
            { data: 'Count', header: true },
          ],
          ['Browser API Usage', stats.byType['browser-api'].toString()],
          ['Hydration Risks', stats.byType['hydration-risk'].toString()],
          ['Dynamic Import Issues', stats.byType['dynamic-ssr'].toString()],
        ]);

      await core.summary.write();

      // Report individual issues with annotations
      for (const [file, issues] of issuesByFile) {
        core.startGroup(`📄 ${file}`);

        for (const issue of issues) {
          const annotationProps = {
            file,
            startLine: issue.line,
            startColumn: issue.column,
            title: `${issue.api} - ${issue.type}`,
          };

          if (issue.severity === 'error') {
            core.error(`${issue.message}${issue.suggestion ? `\n💡 ${issue.suggestion}` : ''}`, annotationProps);
          } else {
            core.warning(`${issue.message}${issue.suggestion ? `\n💡 ${issue.suggestion}` : ''}`, annotationProps);
          }
        }

        core.endGroup();
      }

      // Fail the action if needed
      if (failOnError) {
        // Strict mode: fail on warnings too
        if (strict && stats.warnings > 0) {
          core.setFailed(
            `Found ${stats.total} SSR compatibility issue(s): ${stats.errors} error(s), ${stats.warnings} warning(s)`
          );
          return;
        }

        // Normal mode: fail only on errors
        if (stats.errors > 0) {
          core.setFailed(`Found ${stats.errors} SSR compatibility error(s)`);
          return;
        }
      } else {
        core.warning(
          `Found ${stats.total} SSR compatibility issue(s): ${stats.errors} error(s), ${stats.warnings} warning(s)`
        );
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Action failed: ${errorMessage}`);
  }
}

run();
