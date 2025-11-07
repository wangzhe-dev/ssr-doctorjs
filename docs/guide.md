# SSR Doctor: Complete Guide for Large Next.js Monorepos

This guide covers advanced usage patterns for SSR Doctor in large-scale Next.js monorepo environments.

---

## Table of Contents

1. [Monorepo Architecture Patterns](#monorepo-architecture-patterns)
2. [Selective Module Scanning](#selective-module-scanning)
3. [next/dynamic Strategy](#nextdynamic-strategy)
4. [Performance Optimization](#performance-optimization)
5. [Team Workflow Integration](#team-workflow-integration)
6. [Migration Strategy](#migration-strategy)
7. [Troubleshooting](#troubleshooting)

---

## Monorepo Architecture Patterns

### Typical Next.js Monorepo Structure

```
monorepo/
├── apps/
│   ├── web/                  # Main web app
│   ├── admin/                # Admin dashboard
│   └── mobile-web/           # Mobile web app
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── utils/                # Shared utilities
│   ├── api-client/           # API client library
│   └── config/               # Shared configs
└── package.json
```

### SSR Doctor Configuration Strategy

**Option 1: Root-level configuration (Recommended)**

```json
// .eslintrc.json (root)
{
  "extends": ["plugin:@ssr-doctor/recommended"],
  "overrides": [
    {
      "files": ["apps/**/*.{ts,tsx}"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "error",
        "@ssr-doctor/dynamic-ssr-flag": "warn",
        "@ssr-doctor/hydration-risk-useeffect": "error"
      }
    },
    {
      "files": ["packages/ui/**/*.{ts,tsx}"],
      "rules": {
        "@ssr-doctor/hydration-risk-useeffect": "error"
      }
    },
    {
      "files": ["packages/utils/**/*.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

**Option 2: Per-app configuration**

```json
// apps/web/.eslintrc.json
{
  "extends": [
    "../../.eslintrc.json",
    "plugin:@ssr-doctor/recommended"
  ]
}
```

---

## Selective Module Scanning

### Problem: Full Monorepo Scans Are Slow

In large monorepos with 1000+ files, scanning everything on every commit is inefficient.

### Solution 1: Scan Only Changed Files (Git-aware)

```bash
# package.json
{
  "scripts": {
    "ssr:check:changed": "git diff --name-only --diff-filter=ACMR origin/main | grep -E '\\.(ts|tsx)$' | xargs ssr-doctor check"
  }
}
```

**GitHub Actions integration:**

```yaml
# .github/workflows/ssr-doctor.yml
name: SSR Doctor (Changed Files)

on:
  pull_request:
    paths:
      - 'apps/**/*.{ts,tsx}'
      - 'packages/ui/**/*.{ts,tsx}'

jobs:
  check-changed:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changed-files
        run: |
          echo "files=$(git diff --name-only --diff-filter=ACMR origin/${{ github.base_ref }} | grep -E '\.(ts|tsx)$' | tr '\n' ' ')" >> $GITHUB_OUTPUT

      - name: Check SSR issues
        if: steps.changed-files.outputs.files != ''
        run: |
          npx ssr-doctor check ${{ steps.changed-files.outputs.files }}
```

### Solution 2: Scan Only Affected Workspaces (Turborepo/Nx)

**With Turborepo:**

```json
// turbo.json
{
  "pipeline": {
    "ssr:check": {
      "dependsOn": ["^build"],
      "outputs": ["ssr-report.md"]
    }
  }
}
```

```bash
# Only scan apps that depend on changed packages
turbo run ssr:check --filter=[HEAD^1]
```

**With Nx:**

```bash
# Scan only affected apps
nx affected --target=ssr:check
```

### Solution 3: Path-based Filtering

```bash
# package.json
{
  "scripts": {
    "ssr:check:apps": "ssr-doctor scan --path 'apps/**/*.{ts,tsx}'",
    "ssr:check:ui": "ssr-doctor scan --path 'packages/ui/**/*.{ts,tsx}'",
    "ssr:check:web": "ssr-doctor scan --path 'apps/web/src'",
    "ssr:check:all": "ssr-doctor scan --path 'apps' --path 'packages/ui'"
  }
}
```

### Solution 4: Ignore Non-SSR Packages

```json
// .ssrdoctorrc.json
{
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "packages/utils/**",        // Pure utility functions
    "packages/api-client/**",   // Node.js only
    "packages/config/**",       // Config files
    "packages/types/**",        // Type definitions
    "**/*.test.{ts,tsx}",       // Test files
    "**/*.spec.{ts,tsx}",
    "**/*.stories.{ts,tsx}"     // Storybook files
  ]
}
```

---

## next/dynamic Strategy

### Understanding next/dynamic SSR Behavior

```tsx
// Default behavior (SSR enabled)
const Component = dynamic(() => import('./Heavy'));
// ✅ Pros: SEO, faster FCP
// ❌ Cons: Larger server bundle, potential SSR errors

// With ssr: false (Client-only)
const Component = dynamic(() => import('./Heavy'), { ssr: false });
// ✅ Pros: Smaller server bundle, no SSR errors
// ❌ Cons: No SEO, content not in initial HTML
```

### When to Use `{ ssr: false }`

| Use Case | Use `ssr: false`? | Reason |
|----------|-------------------|--------|
| Charts/graphs (D3, Chart.js) | ✅ Yes | Uses DOM APIs, heavy client-side logic |
| Maps (Google Maps, Mapbox) | ✅ Yes | Browser-only, not SEO-critical |
| Rich text editors (TinyMCE, Quill) | ✅ Yes | Complex DOM manipulation |
| Video players | ✅ Yes | Media APIs not available on server |
| Authentication widgets | ⚠️ Maybe | Use `useEffect` instead for better UX |
| Navigation/headers | ❌ No | Keep for SEO and initial render |
| Content sections | ❌ No | Important for SEO |
| Forms | ❌ No | Should work without JavaScript |

### Pattern 1: Feature-based Dynamic Imports

```tsx
// apps/web/src/components/DynamicComponents.ts
import dynamic from 'next/dynamic';

// Client-only components (always ssr: false)
export const ChartComponent = dynamic(
  () => import('@repo/ui/charts/LineChart'),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const MapComponent = dynamic(
  () => import('@repo/ui/maps/InteractiveMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export const RichEditor = dynamic(
  () => import('@repo/ui/editors/RichTextEditor'),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

// SSR-compatible (no ssr: false needed)
export const DataTable = dynamic(() => import('@repo/ui/tables/DataTable'));
export const Form = dynamic(() => import('@repo/ui/forms/ContactForm'));
```

**Usage:**

```tsx
import { ChartComponent, DataTable } from '@/components/DynamicComponents';

export default function Dashboard() {
  return (
    <>
      {/* SSR'd */}
      <DataTable data={serverData} />

      {/* Client-only */}
      <ChartComponent data={chartData} />
    </>
  );
}
```

### Pattern 2: Conditional SSR Based on Props

```tsx
// packages/ui/src/Modal.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

interface ModalProps {
  heavy?: boolean;
  children: React.ReactNode;
}

// Light modal (SSR-friendly)
const LightModal = ({ children }: ModalProps) => (
  <div className="modal">{children}</div>
);

// Heavy modal with animations (client-only)
const HeavyModal = dynamic(() => import('./HeavyModalImpl'), {
  ssr: false,
  loading: () => <LightModal>Loading...</LightModal>,
});

export function Modal({ heavy, children }: ModalProps) {
  if (heavy) {
    return <HeavyModal>{children}</HeavyModal>;
  }
  return <LightModal>{children}</LightModal>;
}
```

### Pattern 3: Workspace-level Dynamic Import Registry

```tsx
// packages/ui/src/registry/dynamic.ts
import dynamic from 'next/dynamic';

/**
 * Centralized registry of all dynamic imports in the UI package
 * This makes it easy to audit which components are client-only
 */
export const DynamicRegistry = {
  // Client-only components
  clientOnly: {
    Chart: dynamic(() => import('../charts/Chart'), { ssr: false }),
    Map: dynamic(() => import('../maps/Map'), { ssr: false }),
    Editor: dynamic(() => import('../editors/Editor'), { ssr: false }),
  },

  // SSR-compatible but code-split
  lazy: {
    DataGrid: dynamic(() => import('../grids/DataGrid')),
    Calendar: dynamic(() => import('../calendar/Calendar')),
  },

  // SSR-required (no dynamic import)
  ssr: {
    // Import directly, don't use dynamic
  },
} as const;
```

**ESLint configuration to enforce usage:**

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "@repo/ui/charts/Chart",
            "message": "Import Chart from @repo/ui/registry/dynamic instead"
          }
        ]
      }
    ]
  }
}
```

---

## Performance Optimization

### 1. Parallel Scanning in CI

```yaml
# .github/workflows/ssr-doctor-parallel.yml
name: SSR Doctor (Parallel)

on: [pull_request]

jobs:
  scan-matrix:
    strategy:
      matrix:
        workspace:
          - apps/web
          - apps/admin
          - apps/mobile-web
          - packages/ui
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan ${{ matrix.workspace }}
        run: npx ssr-doctor scan --path ${{ matrix.workspace }}
```

### 2. Caching ESLint Results

```yaml
# .github/workflows/ci.yml
- name: Cache ESLint
  uses: actions/cache@v3
  with:
    path: .eslintcache
    key: eslint-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('**/*.{ts,tsx}') }}

- name: Lint with cache
  run: pnpm eslint --cache --cache-location .eslintcache
```

### 3. Incremental Adoption

Don't enable all rules at once in a large codebase:

**Phase 1: Warn on new violations**

```json
{
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "warn",
    "@ssr-doctor/dynamic-ssr-flag": "off",
    "@ssr-doctor/hydration-risk-useeffect": "off"
  }
}
```

**Phase 2: Block new violations, tolerate existing**

```bash
# Generate baseline of existing issues
npx ssr-doctor scan --format json --out .ssr-baseline.json

# In CI: only fail on NEW issues
npx ssr-doctor scan --baseline .ssr-baseline.json --strict
```

**Phase 3: Full enforcement**

```json
{
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

---

## Team Workflow Integration

### Developer Experience Setup

**1. Pre-commit Hooks (lint-staged)**

```json
// package.json
{
  "lint-staged": {
    "apps/**/*.{ts,tsx}": [
      "eslint --fix",
      "ssr-doctor check"
    ],
    "packages/ui/**/*.{ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

```bash
# Install
pnpm add -D husky lint-staged

# Setup
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

**2. VS Code Workspace Settings**

```json
// .vscode/settings.json
{
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "eslint.options": {
    "extensions": [".ts", ".tsx"]
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    { "pattern": "apps/*" },
    { "pattern": "packages/*" }
  ]
}
```

**3. Weekly Reports**

```bash
# Generate weekly report
npx ssr-doctor scan --format markdown --out reports/ssr-$(date +%Y-%m-%d).md

# Track progress over time
git add reports/
git commit -m "docs: weekly SSR report"
```

### Code Review Checklist

Add to `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## SSR Compatibility Checklist

- [ ] No browser APIs used in Server Components
- [ ] `next/dynamic` imports have `{ ssr: false }` where needed
- [ ] No hydration mismatches (tested locally)
- [ ] SSR Doctor CI check passes
```

---

## Migration Strategy

### Step 1: Audit Current State

```bash
# Generate comprehensive report
npx ssr-doctor scan --format markdown --out audit.md

# Categorize by severity
npx ssr-doctor scan --format json | jq '.errors | length'
npx ssr-doctor scan --format json | jq '.warnings | length'
```

### Step 2: Prioritize Fixes

**Priority Matrix:**

| Priority | Criteria | Action |
|----------|----------|--------|
| **P0 - Critical** | Runtime crashes in production | Fix immediately |
| **P1 - High** | Hydration mismatches | Fix within 1 sprint |
| **P2 - Medium** | Missing `{ ssr: false }` | Fix within 1 month |
| **P3 - Low** | Potential issues in rarely-used code | Fix opportunistically |

### Step 3: Create Fix Plan

```typescript
// scripts/categorize-issues.ts
import { execSync } from 'child_process';
import fs from 'fs';

const report = JSON.parse(
  execSync('npx ssr-doctor scan --format json').toString()
);

const categories = {
  critical: [],
  high: [],
  medium: [],
  low: [],
};

// Categorize based on file path and rule
for (const [file, issues] of Object.entries(report)) {
  for (const issue of issues) {
    if (file.includes('/app/') && issue.rule === 'no-browser-api-in-ssr') {
      categories.critical.push({ file, issue });
    } else if (issue.rule === 'hydration-risk-useeffect') {
      categories.high.push({ file, issue });
    } else if (issue.rule === 'dynamic-ssr-flag') {
      categories.medium.push({ file, issue });
    } else {
      categories.low.push({ file, issue });
    }
  }
}

fs.writeFileSync('fix-plan.json', JSON.stringify(categories, null, 2));
console.log(`
Fix Plan:
- Critical: ${categories.critical.length}
- High: ${categories.high.length}
- Medium: ${categories.medium.length}
- Low: ${categories.low.length}
`);
```

### Step 4: Batch Fixes

**Use auto-fix for dynamic imports:**

```bash
# Fix all dynamic-ssr-flag issues
eslint --fix --rule '@ssr-doctor/dynamic-ssr-flag: error' apps/
```

**Manual fixes in batches:**

```bash
# Fix one app at a time
npx ssr-doctor fix --rule all --path apps/web

# Fix one package at a time
npx ssr-doctor fix --rule all --path packages/ui
```

### Step 5: Prevent Regressions

```yaml
# .github/workflows/ssr-doctor.yml
- name: Check for new SSR issues
  run: |
    npx ssr-doctor scan --baseline .ssr-baseline.json --strict
    if [ $? -ne 0 ]; then
      echo "❌ New SSR issues detected"
      exit 1
    fi
```

---

## Troubleshooting

### Issue 1: False Positives in Utility Functions

**Problem:**

```typescript
// packages/utils/src/browser-utils.ts
export function getBrowserInfo() {
  return window.navigator.userAgent; // ❌ Flagged but intended for client-only
}
```

**Solution 1: Add file-level override**

```typescript
/* eslint-disable @ssr-doctor/no-browser-api-in-ssr */
export function getBrowserInfo() {
  return window.navigator.userAgent;
}
/* eslint-enable @ssr-doctor/no-browser-api-in-ssr */
```

**Solution 2: Move to dedicated client-utils file**

```
packages/utils/
├── src/
│   ├── shared/          # SSR-safe utilities
│   └── client/          # Browser-only utilities
```

```json
// .eslintrc.json
{
  "overrides": [
    {
      "files": ["**/client/**/*.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

### Issue 2: Third-party Libraries with Browser APIs

**Problem:**

```typescript
import { Chart } from 'some-chart-library'; // Uses window internally
```

**Solution: Wrap in dynamic import**

```typescript
// components/ChartWrapper.tsx
'use client';
import dynamic from 'next/dynamic';

const Chart = dynamic(
  () => import('some-chart-library').then((mod) => mod.Chart),
  { ssr: false }
);

export function ChartWrapper(props) {
  return <Chart {...props} />;
}
```

### Issue 3: Shared Components Between SSR and CSR Apps

**Problem:**

```typescript
// packages/ui/src/Modal.tsx
// Used in both Next.js (SSR) and React SPA (CSR)
export function Modal() {
  const width = window.innerWidth; // ❌ Breaks in Next.js
}
```

**Solution: Runtime detection**

```typescript
export function Modal() {
  const [width, setWidth] = useState(() => {
    // Safe in both environments
    return typeof window !== 'undefined' ? window.innerWidth : 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div style={{ width }}>Modal</div>;
}
```

### Issue 4: Performance Issues with Large Monorepos

**Problem:** Scanning 2000+ files takes too long in CI.

**Solution: Parallel scanning with changed files only**

```yaml
# .github/workflows/ssr-doctor-optimized.yml
jobs:
  find-changed:
    outputs:
      workspaces: ${{ steps.find.outputs.workspaces }}
    steps:
      - id: find
        run: |
          # Find workspaces with changed files
          CHANGED=$(git diff --name-only origin/main | grep -E '\.(ts|tsx)$')
          WORKSPACES=$(echo "$CHANGED" | cut -d'/' -f1-2 | sort -u | jq -R -s -c 'split("\n")[:-1]')
          echo "workspaces=$WORKSPACES" >> $GITHUB_OUTPUT

  scan-changed:
    needs: find-changed
    strategy:
      matrix:
        workspace: ${{ fromJson(needs.find-changed.outputs.workspaces) }}
    runs-on: ubuntu-latest
    steps:
      - run: npx ssr-doctor scan --path ${{ matrix.workspace }}
```

---

## Best Practices Summary

### ✅ Do's

1. **Enable incrementally**: Start with warnings, upgrade to errors
2. **Use path-based configs**: Different rules for apps vs packages
3. **Leverage caching**: Use `.eslintcache` in CI
4. **Scan changed files only**: Use git diff in pre-commit hooks
5. **Centralize dynamic imports**: Create a registry for large projects
6. **Document exceptions**: Use ESLint comments with explanations
7. **Track progress**: Generate weekly reports
8. **Automate fixes**: Use `--fix` for `dynamic-ssr-flag`

### ❌ Don'ts

1. **Don't scan everything on every commit**: Too slow
2. **Don't ignore all warnings**: They often indicate real issues
3. **Don't disable rules globally**: Use file/directory overrides
4. **Don't forget test files**: Add to ignore patterns
5. **Don't skip CI checks**: They prevent regressions
6. **Don't fix everything at once**: Incremental adoption is key
7. **Don't forget documentation**: Update team wiki/runbook
8. **Don't ignore third-party libs**: Wrap with dynamic imports

---

## Resources

- **[SSR Doctor Repository](https://github.com/wangzhe-dev/ssr-doctorjs)**
- **[Next.js SSR Documentation](https://nextjs.org/docs/basic-features/data-fetching/server-side-rendering)**
- **[React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)**
- **[Turborepo Docs](https://turbo.build/repo/docs)**
- **[Nx Docs](https://nx.dev/)**

---

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/wangzhe-dev/ssr-doctorjs/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/wangzhe-dev/ssr-doctorjs/discussions)
- **Documentation**: [Full docs](../README.md)

---

**Last updated**: 2025-01-07
