# SSR Doctor

<p align="center">
  <img src="https://img.shields.io/npm/v/@ssr-doctor/eslint-plugin?label=eslint-plugin&color=blue" alt="npm version" />
  <img src="https://img.shields.io/npm/v/@ssr-doctor/cli?label=cli&color=green" alt="cli version" />
  <img src="https://img.shields.io/badge/GitHub%20Action-Available-success?logo=github" alt="GitHub Action" />
  <img src="https://img.shields.io/npm/dm/@ssr-doctor/eslint-plugin" alt="npm downloads" />
  <img src="https://img.shields.io/github/actions/workflow/status/wangzhe-dev/ssr-doctorjs/ci.yml?branch=main" alt="CI status" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

> **A comprehensive toolset for detecting and preventing SSR compatibility issues in React and Next.js applications.**

Catch server-side rendering errors before they reach production. SSR Doctor helps you identify and fix common SSR pitfalls with static analysis, runtime scanning, and automated CI/CD checks.

---

## 🎯 Why SSR Doctor?

Server-Side Rendering is powerful but comes with a critical caveat: **browser APIs don't exist on the server**. Common issues include:

| Problem | Impact | SSR Doctor Solution |
|---------|--------|---------------------|
| `ReferenceError: window is not defined` | 💥 **Runtime crashes** | Detects at build time |
| Hydration mismatches | 🐛 **UI bugs & flickering** | Prevents with `hydration-risk-useeffect` |
| Missing `{ ssr: false }` in dynamic imports | 📦 **Bundle bloat** | Auto-fixes with `dynamic-ssr-flag` |
| Inconsistent server/client rendering | ⚠️ **Console warnings** | Catches before deployment |

### Real-World Example

```tsx
// ❌ This crashes on the server
export default function Component() {
  const width = window.innerWidth;  // ReferenceError!
  return <div>{width}</div>;
}

// ✅ SSR Doctor fixes it
export default function Component() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  return <div>{width}</div>;
}
```

---

## 📦 Packages

This monorepo contains three complementary tools:

### [@ssr-doctor/eslint-plugin](./packages/eslint-plugin-ssr-doctor)

ESLint plugin with 3 core rules for catching SSR issues during development.

```bash
npm install --save-dev @ssr-doctor/eslint-plugin
```

**Features:**
- ✅ Detects 25+ browser APIs
- ✅ Context-aware (respects `'use client'` directive)
- ✅ Auto-fix for `dynamic-ssr-flag`
- ✅ Zero false positives with typeof guards

### [@ssr-doctor/cli](./packages/cli)

Command-line scanner for project-wide SSR analysis.

```bash
npm install -g @ssr-doctor/cli
```

**Features:**
- ✅ Markdown/JSON/SARIF reports
- ✅ Cross-file dependency analysis
- ✅ CI-friendly exit codes
- ✅ Auto-fix codemods

### [@ssr-doctor/action](./packages/action)

GitHub Action for automated PR checks with inline comments.

```yaml
- uses: ssr-doctor/action@v1
  with:
    path: ./src
```

**Features:**
- ✅ PR comment reports with detailed explanations
- ✅ Inline annotations on problematic lines
- ✅ Configurable strictness levels
- ✅ Zero-config setup (works immediately)
- ✅ SARIF output for GitHub Code Scanning
- ✅ Custom output formats (text, JSON, markdown)

---

## 🚀 Quick Start

### Option 1: ESLint Plugin (Recommended for Development)

Best for catching issues while coding with IDE integration.

**Installation:**
```bash
pnpm add -D @ssr-doctor/eslint-plugin
```

**Configuration:**
```json
// .eslintrc.json
{
  "extends": ["plugin:@ssr-doctor/recommended"]
}
```

**Usage:**
```bash
# Check files
pnpm eslint src/

# Auto-fix dynamic imports
pnpm eslint src/ --fix
```

**IDE Integration:**
Works automatically with ESLint extensions in VS Code, WebStorm, etc.

---

### Option 2: CLI (Recommended for CI/CD)

Best for project-wide scanning and CI pipelines.

**Installation:**
```bash
pnpm add -D @ssr-doctor/cli
```

**Usage:**
```bash
# Scan entire project
npx ssr-doctor scan --path ./src

# Output to Markdown
npx ssr-doctor scan --format markdown --out report.md

# Strict mode (fail on warnings)
npx ssr-doctor scan --strict

# Auto-fix issues
npx ssr-doctor fix --rule all
```

**Add to package.json:**
```json
{
  "scripts": {
    "ssr:check": "ssr-doctor scan --path ./src --strict",
    "ssr:fix": "ssr-doctor fix --rule all"
  }
}
```

**CI Integration:**
```yaml
# .github/workflows/ci.yml
- name: Check SSR compatibility
  run: pnpm ssr:check
```

---

### Option 3: GitHub Action (Recommended for Teams)

Best for automated PR reviews with team collaboration.

**Setup:**
```yaml
# .github/workflows/ssr-doctor.yml
name: SSR Doctor

on: [pull_request]

jobs:
  ssr-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check SSR compatibility
        uses: ssr-doctor/action@v1
        with:
          path: ./src
          fail-on-error: true
          token: ${{ secrets.GITHUB_TOKEN }}
```

**Result:**
- ✅ Inline comments on problematic lines with fix suggestions
- ✅ Summary table in PR comments showing all issues
- ✅ Fails PR check if issues found (prevents accidental merge)
- ✅ Links to documentation for each violation type
- ✅ Works with branch protection rules

**Advanced Options:**
```yaml
- uses: ssr-doctor/action@v1
  with:
    path: ./src                    # Directory to scan
    format: markdown               # Output format (text|json|markdown|sarif)
    strict: true                   # Fail on warnings too
    ignore: "**/*.test.tsx"        # Ignore patterns
    fail-on-error: false           # Report only, don't fail
```

---

## 📋 Rules Reference

### Rule 1: `no-browser-api-in-ssr`

**Severity:** Error
**Auto-fixable:** No (requires manual refactoring)

**What it does:**
Prevents direct usage of browser-only APIs in Server Components, API routes, and middleware.

**Detected APIs:**
`window`, `document`, `navigator`, `location`, `localStorage`, `sessionStorage`, `history`, `HTMLElement`, `Node`, `Event`, `Image`, `FormData`, `Blob`, `File`, `crypto`, `indexedDB`, `IntersectionObserver`, `MutationObserver`, `ResizeObserver`, and more.

**Detected in:**
- ✅ `app/` directory (Next.js App Router)
- ✅ `pages/` directory
- ✅ `middleware.ts`
- ✅ API routes (`route.ts`)

**Ignored in:**
- ✅ Files with `'use client'` directive
- ✅ Code inside `typeof window !== 'undefined'` guards
- ✅ Code inside `useEffect` hooks

#### Examples

**❌ Bad:**
```tsx
// app/components/Header.tsx (Server Component)
export default function Header() {
  const width = window.innerWidth; // Error: window not defined on server
  return <header>{width}</header>;
}
```

**✅ Good - Option 1: Use 'use client'**
```tsx
'use client';
export default function Header() {
  const width = window.innerWidth; // OK: Client Component
  return <header>{width}</header>;
}
```

**✅ Good - Option 2: Use typeof guard**
```tsx
export default function Header() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  return <header>{width}</header>;
}
```

**✅ Good - Option 3: Use useEffect**
```tsx
'use client';
import { useEffect, useState } from 'react';

export default function Header() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  return <header>{width}</header>;
}
```

---

### Rule 2: `dynamic-ssr-flag`

**Severity:** Warning
**Auto-fixable:** ✅ Yes

**What it does:**
Enforces `{ ssr: false }` option when using `next/dynamic` to prevent SSR issues and reduce bundle size.

**Why this matters:**
- Without `ssr: false`, Next.js attempts to render the component on the server
- If the component uses browser APIs, it will crash during SSR
- Even if it doesn't crash, unnecessary code is included in the server bundle

#### Examples

**❌ Bad:**
```tsx
import dynamic from 'next/dynamic';

// Missing ssr: false - component will be SSR'd
const Chart = dynamic(() => import('./Chart'));
```

**✅ Good:**
```tsx
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
});
```

**Auto-fix:**
```bash
# Automatically adds { ssr: false }
eslint --fix src/components/
```

---

### Rule 3: `hydration-risk-useeffect`

**Severity:** Error
**Auto-fixable:** Partial (can add typeof guards)

**What it does:**
Detects browser API usage during React component render that will cause hydration mismatches.

**Why this is a problem:**

When you access browser APIs during render, the server and client produce different HTML:

```tsx
// ❌ Server renders: <div>false</div>
// ❌ Client renders: <div>true</div>
// ❌ Hydration mismatch warning!
function Component() {
  const isMobile = window.innerWidth < 768;
  return <div>{isMobile}</div>;
}
```

This causes:
1. **Console warnings**: "Text content did not match"
2. **Visual flickering**: UI changes after hydration
3. **Lost event listeners**: React can't attach handlers correctly

#### Examples

**❌ Bad:**
```tsx
function ProductCard() {
  // Runs during render - different on server vs client
  const isMobile = window.innerWidth < 768;

  return (
    <div>
      {isMobile ? (
        <MobileLayout /> // Server shows this
      ) : (
        <DesktopLayout /> // Client shows this after flash
      )}
    </div>
  );
}
```

**✅ Good - Option 1: Move to useEffect**
```tsx
function ProductCard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

**✅ Good - Option 2: Use CSS media queries**
```tsx
function ProductCard() {
  return (
    <div>
      <div className="mobile:block desktop:hidden">
        <MobileLayout />
      </div>
      <div className="mobile:hidden desktop:block">
        <DesktopLayout />
      </div>
    </div>
  );
}
```

**✅ Good - Option 3: Use next/dynamic**
```tsx
const MobileLayout = dynamic(() => import('./MobileLayout'), { ssr: false });
const DesktopLayout = dynamic(() => import('./DesktopLayout'), { ssr: false });
```

---

## 🎬 Demo

> **📄 [View Complete Demo Output](./docs/demo-output.md)** - Detailed detection examples with test coverage reports

### Quick CLI Scanning Demo

```bash
npx ssr-doctor scan --path ./src
```

**Sample Output:**
```
🔍 Scanning for SSR issues...
Found 23 files to analyze

⚠ Found 8 SSR issue(s) in 3 file(s):

src/components/Header.tsx:
  12:15 window - Direct window usage detected
    const width = window.innerWidth;

  18:8 localStorage - Direct localStorage usage detected
    localStorage.setItem('theme', 'dark');

src/pages/dashboard.tsx:
  34:10 navigator - Direct navigator usage detected
    const ua = navigator.userAgent;

src/app/layout.tsx:
  15:20 document - Direct document usage detected
    document.title = 'Dashboard';

💡 Run 'ssr-doctor fix' to auto-fix compatible issues
💡 Add 'typeof window !== "undefined"' guards for runtime checks
```

### Real Violation Detection

The [demo output document](./docs/demo-output.md) showcases SSR Doctor detecting 4 real violations in [`examples/next-app`](./examples/next-app):

1. ❌ **Direct window usage** in `WidthDetector.tsx` (no guard)
2. ❌ **Hydration risk** from render-time browser API access
3. ❌ **Missing `{ ssr: false }`** in `ChartComponent` dynamic import
4. ❌ **Missing `{ ssr: false }`** in `MapComponent` dynamic import

**Detection Rate**: 100% (4/4 violations found)
**Test Coverage**: 94.73% (ESLint Plugin) | 89.47% (CLI)

### ESLint Integration Demo

**VS Code with ESLint extension:**
- Red squiggly lines under browser API usage
- Hover for detailed error messages
- Quick fix suggestions
- Real-time feedback as you type

### GitHub Action Demo

**PR Comment:**
```markdown
## SSR Doctor Report

📊 **Summary**: Found 5 issues in 2 files

| Severity | Count |
|----------|-------|
| Error    | 3     |
| Warning  | 2     |

### Issues by File

#### src/components/Chart.tsx
- Line 45: Direct `window` usage in server component
- Line 67: Missing `{ ssr: false }` in dynamic import

#### src/app/dashboard/page.tsx
- Line 23: `localStorage` accessed during render (hydration risk)

👉 [View full report](link-to-report)
```

---

## 📚 Documentation

- **[Demo Output & Test Coverage](./docs/demo-output.md)** - Real violation detection examples
- **[Guide: Using SSR Doctor in Large Monorepos](./docs/guide.md)**
- **[Rule Reference](./packages/eslint-plugin-ssr-doctor/README.md)**
- **[CLI Documentation](./packages/cli/README.md)**
- **[GitHub Action Setup](./packages/action/README.md)**
- **[Contributing Guide](./CONTRIBUTING.md)**
- **[Migration Guide](./docs/migration.md)** (coming soon)

---

## 🎓 Examples

Comprehensive examples in [`examples/next-app`](./examples/next-app):

1. **Common SSR Violations**: See real-world problematic patterns
2. **Correct Patterns**: Learn SSR-safe alternatives
3. **Dynamic Import Usage**: Best practices with `next/dynamic`
4. **Hydration-Safe Code**: Prevent client/server mismatches

**Run the example:**
```bash
cd examples/next-app
pnpm install
pnpm lint  # See SSR Doctor in action
```

---

## 🔧 Configuration

### ESLint Plugin Options

```json
{
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": ["error", {
      "allowedAPIs": ["navigator"]  // Allow specific APIs
    }],
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

### CLI Options

```bash
ssr-doctor scan [options]

Options:
  --path <path>          Path to scan (default: "./src")
  --format <format>      Output format: text|markdown|json|sarif
  --out <file>           Write output to file
  --strict               Exit with code 1 on warnings (not just errors)
  --ignore <patterns>    Glob patterns to ignore
```

### GitHub Action Inputs

```yaml
- uses: ssr-doctor/action@v1
  with:
    path: ./src              # Path to scan
    format: markdown         # Report format
    strict: true            # Fail on warnings
    token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🧪 Testing SSR Doctor

**Unit Tests:**
```bash
pnpm test
```

**Integration Tests:**
```bash
cd examples/next-app
pnpm lint  # Should find violations
```

**Build Tests:**
```bash
pnpm build  # All packages should build successfully
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- Commit message conventions
- PR process

### Quick Contribution Guide

```bash
# 1. Fork and clone
git clone https://github.com/your-username/ssr-doctorjs.git

# 2. Install dependencies
pnpm install

# 3. Create a branch
git checkout -b feature/your-feature

# 4. Make changes and test
pnpm build
pnpm test

# 5. Commit with conventional commits
git commit -m "feat: add new rule for detecting..."

# 6. Push and create PR
git push origin feature/your-feature
```

---

## 🗺️ Roadmap

- [ ] **v0.2.0**: Additional rules (Server Actions, async components)
- [ ] **v0.3.0**: VS Code extension with inline fixes
- [ ] **v0.4.0**: Automatic codemod for common patterns
- [ ] **v1.0.0**: Stable API, full Next.js 14+ support

See [GitHub Issues](https://github.com/wangzhe-dev/ssr-doctorjs/issues) for planned features.

---

## 📊 Comparison

| Feature | SSR Doctor | ESLint Only | Runtime Checks |
|---------|-----------|-------------|----------------|
| **Catch issues at** | Build time | Build time | Runtime |
| **Browser API detection** | ✅ 25+ APIs | ❌ Manual rules | ✅ All |
| **Context-aware** | ✅ Respects 'use client' | ❌ | N/A |
| **Auto-fix** | ✅ Some rules | ✅ Some rules | ❌ |
| **CI integration** | ✅ Native | ✅ | ❌ |
| **Performance impact** | None | None | ⚠️ Runtime overhead |
| **False positives** | ✅ Minimal | ⚠️ Common | ✅ None |
| **Learning curve** | Low | Medium | N/A |

---

## 💼 Used By

*Add your company/project here!*

---

## 📜 License

MIT © 2025 SSR Doctor Contributors

See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [ESLint](https://eslint.org/) - Pluggable linting utility
- [TypeScript ESLint](https://typescript-eslint.io/) - TypeScript support for ESLint
- [Next.js](https://nextjs.org/) - React framework
- [Vitest](https://vitest.dev/) - Testing framework

Special thanks to the Next.js and React communities for SSR best practices.

---

## 📞 Support

- **Documentation**: [docs/](./docs)
- **Issues**: [GitHub Issues](https://github.com/wangzhe-dev/ssr-doctorjs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wangzhe-dev/ssr-doctorjs/discussions)

---

<p align="center">
  <strong>⭐ Star this repo if SSR Doctor helps you ship better React apps!</strong>
</p>
