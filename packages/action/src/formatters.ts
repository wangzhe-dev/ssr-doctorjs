import { getIssueStats, type SSRIssue } from '@ssr-doctor/core';

export interface FormatOptions {
  verbose?: boolean;
  color?: boolean;
}

/**
 * Format issues as plain text
 */
export function formatText(issuesByFile: Map<string, SSRIssue[]>, options: FormatOptions = {}): string {
  const allIssues = Array.from(issuesByFile.values()).flat();
  const stats = getIssueStats(allIssues);

  if (stats.total === 0) {
    return '✓ No SSR compatibility issues found!\n';
  }

  let output = '';

  // Summary
  output += `\n⚠️  Found ${stats.total} SSR issue(s) in ${stats.files} file(s)\n`;
  output += `   ${stats.errors} error(s), ${stats.warnings} warning(s)\n\n`;

  // Issues by file
  for (const [file, issues] of issuesByFile) {
    output += `\n${file}:\n`;

    for (const issue of issues) {
      const severityIcon = issue.severity === 'error' ? '✗' : '⚠';
      const location = `${issue.line}:${issue.column}`;

      output += `  ${severityIcon} ${location} ${issue.api} - ${issue.message}\n`;

      if (options.verbose) {
        output += `     ${issue.code}\n`;
        if (issue.suggestion) {
          output += `     💡 ${issue.suggestion}\n`;
        }
      }
    }
  }

  // Tips
  output += '\n💡 Tips:\n';
  output += '   - Use "typeof window !== \'undefined\'" to check for browser environment\n';
  output += '   - Move browser API calls to useEffect hooks\n';
  output += '   - Add { ssr: false } to next/dynamic imports\n\n';

  return output;
}

/**
 * Format issues as JSON
 */
export function formatJSON(issuesByFile: Map<string, SSRIssue[]>, options: FormatOptions = {}): string {
  const allIssues = Array.from(issuesByFile.values()).flat();
  const stats = getIssueStats(allIssues);

  const output = {
    summary: stats,
    issues: Object.fromEntries(issuesByFile),
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Format issues as Markdown
 */
export function formatMarkdown(issuesByFile: Map<string, SSRIssue[]>, options: FormatOptions = {}): string {
  const allIssues = Array.from(issuesByFile.values()).flat();
  const stats = getIssueStats(allIssues);

  if (stats.total === 0) {
    return '# ✅ SSR Doctor Report\n\n**No SSR compatibility issues found!**\n';
  }

  let output = '# ⚠️ SSR Doctor Report\n\n';

  // Summary table
  output += '## Summary\n\n';
  output += '| Metric | Count |\n';
  output += '|--------|-------|\n';
  output += `| Total Issues | ${stats.total} |\n`;
  output += `| Errors | ${stats.errors} |\n`;
  output += `| Warnings | ${stats.warnings} |\n`;
  output += `| Files | ${stats.files} |\n\n`;

  // Issues by type
  output += '## Issues by Type\n\n';
  output += '| Type | Count |\n';
  output += '|------|-------|\n';
  output += `| Browser API Usage | ${stats.byType['browser-api']} |\n`;
  output += `| Hydration Risks | ${stats.byType['hydration-risk']} |\n`;
  output += `| Dynamic Import Issues | ${stats.byType['dynamic-ssr']} |\n\n`;

  // Detailed issues
  output += '## Detailed Issues\n\n';

  for (const [file, issues] of issuesByFile) {
    output += `### 📄 \`${file}\`\n\n`;

    for (const issue of issues) {
      const severityBadge = issue.severity === 'error' ? '🔴 **Error**' : '🟡 **Warning**';

      output += `#### Line ${issue.line}:${issue.column} - ${severityBadge}\n\n`;
      output += `**Issue**: ${issue.message}\n\n`;
      output += `**Code**:\n\`\`\`typescript\n${issue.code}\n\`\`\`\n\n`;

      if (issue.suggestion) {
        output += `**💡 Suggestion**: ${issue.suggestion}\n\n`;
      }

      output += '---\n\n';
    }
  }

  // Quick fixes
  output += '## 💡 Quick Fixes\n\n';
  output += '1. **Add typeof guards**:\n';
  output += '   ```typescript\n';
  output += '   if (typeof window !== "undefined") {\n';
  output += '     // Use window here\n';
  output += '   }\n';
  output += '   ```\n\n';
  output += '2. **Move to useEffect**:\n';
  output += '   ```typescript\n';
  output += '   useEffect(() => {\n';
  output += '     const width = window.innerWidth;\n';
  output += '     setWidth(width);\n';
  output += '   }, []);\n';
  output += '   ```\n\n';
  output += '3. **Add ssr: false to dynamic imports**:\n';
  output += '   ```typescript\n';
  output += '   const Chart = dynamic(() => import("./Chart"), { ssr: false });\n';
  output += '   ```\n\n';

  return output;
}

/**
 * Format issues as SARIF (Static Analysis Results Interchange Format)
 * Used by GitHub Code Scanning
 */
export function formatSARIF(issuesByFile: Map<string, SSRIssue[]>, options: FormatOptions = {}): string {
  const allIssues = Array.from(issuesByFile.values()).flat();

  const results = allIssues.map((issue) => ({
    ruleId: issue.type,
    level: issue.severity === 'error' ? 'error' : 'warning',
    message: {
      text: issue.message,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: issue.file,
          },
          region: {
            startLine: issue.line,
            startColumn: issue.column,
          },
        },
      },
    ],
    fixes: issue.suggestion
      ? [
          {
            description: {
              text: issue.suggestion,
            },
          },
        ]
      : undefined,
  }));

  const sarif = {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'SSR Doctor',
            version: '1.0.0',
            informationUri: 'https://github.com/wangzhe-dev/ssr-doctorjs',
            rules: [
              {
                id: 'browser-api',
                name: 'BrowserAPIUsage',
                shortDescription: {
                  text: 'Browser API used in SSR context',
                },
                fullDescription: {
                  text: 'Detects usage of browser-only APIs in server-side rendering contexts without proper guards',
                },
                helpUri:
                  'https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#no-browser-api-in-ssr',
              },
              {
                id: 'hydration-risk',
                name: 'HydrationRisk',
                shortDescription: {
                  text: 'Browser API may cause hydration mismatch',
                },
                fullDescription: {
                  text: 'Detects browser API usage during render that may cause hydration mismatches between server and client',
                },
                helpUri:
                  'https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#hydration-risk-useeffect',
              },
              {
                id: 'dynamic-ssr',
                name: 'DynamicSSRFlag',
                shortDescription: {
                  text: 'Missing ssr: false in dynamic import',
                },
                fullDescription: {
                  text: 'Detects next/dynamic imports that are missing the { ssr: false } option',
                },
                helpUri:
                  'https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#dynamic-ssr-flag',
              },
            ],
          },
        },
        results,
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
