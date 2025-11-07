# SSR Doctor GitHub Action

<p align="center">
  <img src="https://img.shields.io/badge/GitHub%20Action-SSR%20Doctor-blue?logo=github" alt="GitHub Action" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node Version" />
</p>

> **Automated SSR compatibility checks for React and Next.js applications**

Catch server-side rendering errors in CI/CD before they reach production. SSR Doctor GitHub Action automatically scans your codebase for common SSR pitfalls and provides inline PR comments with fix suggestions.

---

## 🎯 Why Use This Action?

**Problem:** Browser APIs like `window`, `document`, and `localStorage` don't exist on the server, causing runtime crashes and hydration mismatches in SSR applications.

**Solution:** SSR Doctor automatically detects these issues in your CI pipeline and fails PRs before merge, preventing production incidents.

### Key Benefits

| Feature | Benefit |
|---------|---------|
| 🚨 **Early Detection** | Catch SSR issues in CI before deployment |
| 💬 **PR Comments** | Inline annotations on problematic code lines |
| ⚡ **Fast Scanning** | Analyzes entire codebase in seconds |
| 🔧 **Zero Config** | Works out-of-the-box with sensible defaults |
| 📊 **Detailed Reports** | JSON/Markdown reports with fix suggestions |
| 🎯 **Zero False Positives** | Respects `typeof` guards and `'use client'` directives |

---

## 🚀 Quick Start

### Basic Usage

Add this workflow to `.github/workflows/ssr-check.yml`:

```yaml
name: SSR Compatibility Check

on: [pull_request]

jobs:
  ssr-doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for SSR issues
        uses: ssr-doctor/action@v1
        with:
          path: ./src
```

That's it! The action will now:
- ✅ Scan your code on every PR
- ✅ Comment on problematic lines
- ✅ Fail the check if issues are found
- ✅ Provide fix suggestions

---

## 📋 Inputs

### `path`

**Optional** Path to scan for SSR issues.

- **Default:** `./src`
- **Example:** `./app`, `./pages`, `./components`

```yaml
- uses: ssr-doctor/action@v1
  with:
    path: ./app  # Scan only the app directory
```

### `format`

**Optional** Output format for scan results.

- **Default:** `text`
- **Options:** `text`, `json`, `markdown`, `sarif`

```yaml
- uses: ssr-doctor/action@v1
  with:
    format: markdown  # Generate markdown report
```

### `fail-on-error`

**Optional** Whether to fail the action if issues are found.

- **Default:** `true`
- **Type:** boolean

```yaml
- uses: ssr-doctor/action@v1
  with:
    fail-on-error: false  # Report issues but don't fail
```

### `strict`

**Optional** Fail on warnings in addition to errors.

- **Default:** `false`
- **Type:** boolean

```yaml
- uses: ssr-doctor/action@v1
  with:
    strict: true  # Treat warnings as errors
```

### `ignore`

**Optional** Glob patterns to ignore during scanning.

- **Default:** `""`
- **Example:** `"**/*.test.tsx,**/*.stories.tsx"`

```yaml
- uses: ssr-doctor/action@v1
  with:
    ignore: "**/*.test.tsx,**/mocks/**"
```

### `token`

**Optional** GitHub token for posting PR comments.

- **Default:** `${{ github.token }}`
- **Required for:** PR comment annotations

```yaml
- uses: ssr-doctor/action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📤 Outputs

### `issues-found`

Number of SSR compatibility issues detected.

**Type:** string (number)

### `results`

Detailed scan results in JSON format.

**Type:** string (JSON)

### `has-errors`

Whether any errors (not just warnings) were found.

**Type:** boolean

---

## 🎓 Usage Examples

### Example 1: Basic PR Check

Simplest setup - fails PR if SSR issues are found:

```yaml
name: SSR Check

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ssr-doctor/action@v1
```

---

### Example 2: Report Without Failing

Scan and report issues without blocking the PR:

```yaml
name: SSR Check (Report Only)

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan for SSR issues
        uses: ssr-doctor/action@v1
        with:
          fail-on-error: false
          format: markdown
```

---

### Example 3: Custom PR Comment

Use outputs to create custom PR comments:

```yaml
name: SSR Check with Custom Comment

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run SSR Doctor
        id: ssr-check
        uses: ssr-doctor/action@v1
        with:
          fail-on-error: false
          format: json

      - name: Comment on PR
        if: steps.ssr-check.outputs.issues-found > 0
        uses: actions/github-script@v7
        with:
          script: |
            const count = ${{ steps.ssr-check.outputs.issues-found }};
            const results = JSON.parse('${{ steps.ssr-check.outputs.results }}');

            let comment = `## ⚠️ SSR Doctor Found ${count} Issue(s)\n\n`;
            comment += '| File | Line | Issue |\n|------|------|-------|\n';

            for (const [file, issues] of Object.entries(results)) {
              for (const issue of issues) {
                comment += `| ${file} | ${issue.line} | ${issue.message} |\n`;
              }
            }

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

### Example 4: Multiple Paths

Scan multiple directories:

```yaml
name: SSR Check (Multiple Paths)

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        path: ['./app', './pages', './components']
    steps:
      - uses: actions/checkout@v4

      - name: Scan ${{ matrix.path }}
        uses: ssr-doctor/action@v1
        with:
          path: ${{ matrix.path }}
```

---

### Example 5: Monorepo Setup

Scan multiple packages in a monorepo:

```yaml
name: SSR Check (Monorepo)

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package:
          - packages/web/src
          - packages/admin/src
          - packages/mobile/src
    steps:
      - uses: actions/checkout@v4

      - name: Scan ${{ matrix.package }}
        uses: ssr-doctor/action@v1
        with:
          path: ${{ matrix.package }}
```

---

### Example 6: Scheduled Daily Scans

Run SSR checks daily to catch issues proactively:

```yaml
name: Daily SSR Health Check

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run SSR Doctor
        uses: ssr-doctor/action@v1
        with:
          strict: true

      - name: Notify on Slack
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ Daily SSR check found issues!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "SSR Doctor detected compatibility issues in main branch"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

### Example 7: Upload Report as Artifact

Save detailed reports for later analysis:

```yaml
name: SSR Check with Artifact

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run SSR Doctor
        uses: ssr-doctor/action@v1
        with:
          format: markdown
          fail-on-error: false

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ssr-doctor-report
          path: ssr-doctor-report.md
          retention-days: 30
```

---

### Example 8: Integration with Existing Lint Workflow

Add SSR checks to your existing lint workflow:

```yaml
name: Lint & SSR Check

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run ESLint
        run: pnpm lint

      - name: Run TypeScript Check
        run: pnpm type-check

      - name: Run SSR Doctor
        uses: ssr-doctor/action@v1
        with:
          path: ./src
```

---

## 🔍 What It Detects

SSR Doctor scans for **3 categories** of SSR compatibility issues:

### 1. Direct Browser API Usage

Detects 25+ browser-only APIs used without guards:

- ✅ `window`, `document`, `navigator`
- ✅ `localStorage`, `sessionStorage`
- ✅ `location`, `history`
- ✅ `HTMLElement`, `Node`, `Event`
- ✅ `Image`, `FormData`, `Blob`, `File`
- ✅ `crypto`, `indexedDB`
- ✅ `IntersectionObserver`, `MutationObserver`, `ResizeObserver`
- ✅ `requestAnimationFrame`, `cancelAnimationFrame`

**Example Issue:**
```tsx
// ❌ Will crash on server
const width = window.innerWidth;

// ✅ SSR-safe alternative
const width = typeof window !== 'undefined' ? window.innerWidth : 0;
```

### 2. Missing `{ ssr: false }` in Dynamic Imports

Enforces proper usage of `next/dynamic`:

```tsx
// ❌ Component will be SSR'd (may crash if it uses browser APIs)
const Chart = dynamic(() => import('./Chart'));

// ✅ Explicitly disable SSR
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

### 3. Hydration Risks

Detects browser API usage during render that causes hydration mismatches:

```tsx
// ❌ Server renders 0, client renders actual width → mismatch
function Component() {
  const width = window.innerWidth;
  return <div>{width}</div>;
}

// ✅ Use useEffect to avoid mismatch
function Component() {
  const [width, setWidth] = useState(0);
  useEffect(() => setWidth(window.innerWidth), []);
  return <div>{width}</div>;
}
```

---

## 📊 Sample Output

### PR Comment

When issues are found, the action posts a comment like:

```markdown
## ⚠️ SSR Doctor Report

Found **3 issues** in 2 files:

### Critical Issues

#### src/components/Header.tsx

**Line 23:** Direct browser API usage
```tsx
const width = window.innerWidth;
```
❌ `window` is not available during server-side rendering

**Suggested Fix:**
```tsx
const width = typeof window !== 'undefined' ? window.innerWidth : 0;
```

---

#### src/components/Chart.tsx

**Line 5:** Missing `{ ssr: false }` in dynamic import
```tsx
const ChartWidget = dynamic(() => import('./ChartWidget'));
```
❌ Component should explicitly disable SSR

**Suggested Fix:**
```tsx
const ChartWidget = dynamic(() => import('./ChartWidget'), { ssr: false });
```

---

### 💡 Quick Fixes

1. Add `'use client'` directive to components using browser APIs
2. Wrap browser API calls in `typeof window !== 'undefined'` guards
3. Move browser API usage to `useEffect` hooks
4. Add `{ ssr: false }` to `next/dynamic` imports

[View Full Documentation](https://github.com/wangzhe-dev/ssr-doctorjs#readme)
```

---

## 🎯 Framework Support

| Framework | Support Status | Notes |
|-----------|----------------|-------|
| **Next.js 13+** | ✅ Full Support | App Router & Pages Router |
| **Next.js 12** | ✅ Full Support | Pages Router |
| **Remix** | ✅ Full Support | Server/Client detection |
| **Gatsby** | ✅ Full Support | SSR/SSG detection |
| **React 18** | ✅ Full Support | Server Components |
| **Astro** | 🟡 Partial | JavaScript files only |

---

## 🔧 Advanced Configuration

### Ignoring Specific Files

```yaml
- uses: ssr-doctor/action@v1
  with:
    ignore: |
      **/*.test.tsx
      **/*.stories.tsx
      **/mocks/**
      **/__tests__/**
```

### Custom Severity Levels

Combine with other tools for comprehensive checks:

```yaml
- name: SSR Check (Errors Only)
  uses: ssr-doctor/action@v1
  with:
    strict: false

- name: SSR Check (Include Warnings)
  uses: ssr-doctor/action@v1
  with:
    strict: true
    fail-on-error: false  # Report only
```

---

## 🔗 Integration with Other Tools

### With ESLint

Use alongside ESLint for comprehensive linting:

```yaml
- name: ESLint
  run: pnpm eslint .

- name: SSR Doctor
  uses: ssr-doctor/action@v1
```

### With Lighthouse CI

Combine with Lighthouse for full quality checks:

```yaml
- name: SSR Check
  uses: ssr-doctor/action@v1

- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
```

---

## 📚 Additional Resources

- **[Main Documentation](https://github.com/wangzhe-dev/ssr-doctorjs#readme)** - Complete project documentation
- **[ESLint Plugin](https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor)** - Development-time linting
- **[CLI Tool](https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/cli)** - Local scanning
- **[Demo Output](https://github.com/wangzhe-dev/ssr-doctorjs/blob/main/docs/demo-output.md)** - See detection examples
- **[FAQ](https://github.com/wangzhe-dev/ssr-doctorjs/blob/main/docs/faq.md)** - Common questions

---

## 🤝 Contributing

Found a bug or have a feature request? Please [open an issue](https://github.com/wangzhe-dev/ssr-doctorjs/issues).

---

## 📜 License

MIT © 2025 SSR Doctor Contributors

---

## 💡 Pro Tips

1. **Start Lenient**: Begin with `fail-on-error: false` to assess your codebase
2. **Gradual Adoption**: Use `ignore` patterns to exclude legacy code initially
3. **Combine Tools**: Use alongside ESLint plugin for maximum coverage
4. **Monitor Trends**: Track `issues-found` output over time
5. **Team Education**: Share PR comments as teaching moments for SSR best practices

---

<p align="center">
  <strong>⭐ If SSR Doctor helps secure your app, give us a star on <a href="https://github.com/wangzhe-dev/ssr-doctorjs">GitHub</a>!</strong>
</p>
