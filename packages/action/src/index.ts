import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { glob } from 'glob';
import { detectSSRIssues } from '@ssr-doctor/cli';

async function run(): Promise<void> {
  try {
    const path = core.getInput('path') || './src';
    const format = core.getInput('format') || 'text';
    const failOnError = core.getInput('fail-on-error') === 'true';

    core.info(`🔍 Scanning ${path} for SSR issues...`);

    const files = await glob(`${path}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
    });

    core.info(`Found ${files.length} files to analyze`);

    let totalIssues = 0;
    const issuesByFile = new Map();

    for (const file of files) {
      const issues = detectSSRIssues(file);
      if (issues.length > 0) {
        issuesByFile.set(file, issues);
        totalIssues += issues.length;
      }
    }

    core.setOutput('issues-found', totalIssues.toString());

    if (format === 'json') {
      const results = Object.fromEntries(issuesByFile);
      core.setOutput('results', JSON.stringify(results, null, 2));
      core.info(JSON.stringify(results, null, 2));
    }

    if (totalIssues === 0) {
      core.info('✅ No SSR issues found!');
    } else {
      core.warning(`⚠️  Found ${totalIssues} SSR issue(s) in ${issuesByFile.size} file(s)`);

      for (const [file, issues] of issuesByFile) {
        core.startGroup(`📄 ${file}`);
        for (const issue of issues as any[]) {
          core.warning(
            `${issue.line}:${issue.column} ${issue.type} - ${issue.message}`,
            {
              file,
              startLine: issue.line,
              startColumn: issue.column,
            }
          );
        }
        core.endGroup();
      }

      if (failOnError) {
        core.setFailed(`Found ${totalIssues} SSR compatibility issue(s)`);
      }
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error}`);
  }
}

run();
