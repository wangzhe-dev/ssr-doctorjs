# SSR Doctor - Frequently Asked Questions

Common questions about using SSR Doctor in your projects.

---

## General Questions

### What is SSR Doctor?

SSR Doctor is a comprehensive toolset for detecting and preventing Server-Side Rendering (SSR) compatibility issues in React and Next.js applications. It consists of:

1. **ESLint Plugin**: Catches issues during development
2. **CLI Tool**: Scans entire projects
3. **GitHub Action**: Automates checks in CI/CD

### Why do I need SSR Doctor?

Browser APIs like `window`, `document`, and `localStorage` don't exist on the server. Using them in SSR contexts causes:

- **Runtime crashes**: `ReferenceError: window is not defined`
- **Hydration mismatches**: Different HTML on server vs client
- **Build failures**: Static generation fails
- **Poor UX**: Flickering content, lost event listeners

SSR Doctor catches these issues **before** they reach production.

### Is SSR Doctor only for Next.js?

No! While it's optimized for Next.js, SSR Doctor works with any React SSR framework:

- ✅ **Next.js** (App Router & Pages Router)
- ✅ **Remix**
- ✅ **Gatsby**
- ✅ **Astro** (with React)
- ✅ **Custom SSR setups**

### How is SSR Doctor different from ESLint alone?

| Feature | SSR Doctor | ESLint Alone |
|---------|-----------|--------------|
| **Context-aware** | Knows about SSR contexts (app/, pages/) | Requires manual configuration |
| **'use client' detection** | Automatically skips client components | No built-in support |
| **Browser API detection** | 25+ APIs out of the box | Must write rules manually |
| **Auto-fix** | Some rules (e.g., dynamic-ssr-flag) | Depends on custom rules |
| **Next.js specific** | Understands next/dynamic, middleware | Generic |

---

## Installation & Setup

### Do I need to install all three packages?

No. Choose based on your needs:

- **Development only**: Install `@ssr-doctor/eslint-plugin`
- **CI/CD only**: Install `@ssr-doctor/cli`
- **GitHub Actions**: Use `@ssr-doctor/action` (no local install needed)
- **Full coverage**: Install all three

### Can I use SSR Doctor with JavaScript (not TypeScript)?

Yes! SSR Doctor works with both:

```json
// .eslintrc.json
{
  "extends": ["plugin:@ssr-doctor/recommended"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  }
}
```

However, TypeScript provides better accuracy due to type information.

### How do I integrate with existing ESLint config?

Just add to your `extends` array:

```json
{
  "extends": [
    "next/core-web-vitals",  // Existing
    "plugin:@ssr-doctor/recommended"  // Add this
  ]
}
```

### Does SSR Doctor slow down my build?

**ESLint plugin**: No noticeable impact (runs during linting anyway)
**CLI**: Minimal impact in CI (~5-10 seconds for 1000 files)
**GitHub Action**: Runs in parallel, doesn't block PR merge

---

## Rules & Configuration

### What browser APIs does SSR Doctor detect?

25+ APIs including:

- **Window**: `window`, `Window`
- **Document**: `document`, `Document`
- **Storage**: `localStorage`, `sessionStorage`
- **Navigation**: `navigator`, `location`, `history`
- **DOM**: `HTMLElement`, `Node`, `Event`, `Element`
- **Observers**: `IntersectionObserver`, `MutationObserver`, `ResizeObserver`
- **Animation**: `requestAnimationFrame`, `cancelAnimationFrame`
- **Media**: `Image`, `Audio`, `Video`, `Blob`, `File`
- **Crypto**: `crypto` (browser), `indexedDB`

See [`packages/eslint-plugin-ssr-doctor/src/utils/browser-apis.ts`](../packages/eslint-plugin-ssr-doctor/src/utils/browser-apis.ts) for the full list.

### How do I allow specific browser APIs?

Use the `allowedAPIs` option:

```json
{
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": ["error", {
      "allowedAPIs": ["navigator", "location"]
    }]
  }
}
```

### Can I disable rules for specific files?

Yes, multiple ways:

**Option 1: Inline comments**
```tsx
/* eslint-disable @ssr-doctor/no-browser-api-in-ssr */
export function browserOnlyFunction() {
  return window.innerWidth;
}
/* eslint-enable @ssr-doctor/no-browser-api-in-ssr */
```

**Option 2: ESLint overrides**
```json
{
  "overrides": [
    {
      "files": ["src/utils/browser-only.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

**Option 3: .eslintignore**
```
src/utils/browser-only.ts
src/legacy/**/*
```

### Why does SSR Doctor flag code inside `typeof window !== 'undefined'`?

It shouldn't! This is likely a bug. Please report it with:

1. Code snippet
2. ESLint configuration
3. SSR Doctor version

```bash
# Check version
npm list @ssr-doctor/eslint-plugin
```

File an issue: https://github.com/wangzhe-dev/ssr-doctorjs/issues

---

## Common Issues

### "window is not defined" errors persist after fixes

**Possible causes:**

1. **Still using browser APIs on server**
   - Check if code is inside `'use client'` directive
   - Verify typeof guards are working
   - Move to `useEffect`

2. **Third-party library using browser APIs**
   ```tsx
   // ❌ Bad
   import { Chart } from 'problematic-library';

   // ✅ Good
   const Chart = dynamic(() => import('problematic-library').then(m => m.Chart), {
     ssr: false
   });
   ```

3. **Top-level code execution**
   ```tsx
   // ❌ Bad - runs on import
   const width = window.innerWidth;

   export function Component() { /*...*/ }

   // ✅ Good - runs after mount
   export function Component() {
     const [width, setWidth] = useState(0);
     useEffect(() => {
       setWidth(window.innerWidth);
     }, []);
   }
   ```

### False positives in test files

**Solution**: Ignore test files

```json
{
  "overrides": [
    {
      "files": ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

Or use `.eslintignore`:
```
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx
```

### ESLint crashes with "Maximum call stack size exceeded"

**Cause**: Circular dependencies or large files

**Solutions**:

1. **Increase Node memory**
   ```json
   {
     "scripts": {
       "lint": "NODE_OPTIONS='--max-old-space-size=4096' eslint ."
     }
   }
   ```

2. **Exclude problematic files**
   ```json
   {
     "ignorePatterns": ["**/generated/**", "**/vendor/**"]
   }
   ```

3. **Report the issue**: https://github.com/wangzhe-dev/ssr-doctorjs/issues

### GitHub Action fails but local ESLint passes

**Common causes:**

1. **Different Node versions**
   ```yaml
   # Specify Node version
   - uses: actions/setup-node@v4
     with:
       node-version: '20'  # Match local version
   ```

2. **Cache issues**
   ```yaml
   # Clear cache
   - run: rm -rf node_modules .eslintcache
   - run: pnpm install
   ```

3. **Different ESLint config**
   - Verify `.eslintrc.json` is committed
   - Check for local overrides (.eslintrc.local.json)

---

## Best Practices

### Should I use `'use client'` everywhere?

**No!** Only use for components that **need** browser APIs:

```tsx
// ❌ Overused
'use client';
export function SimpleButton() {
  return <button>Click me</button>;
}

// ✅ Good - doesn't need 'use client'
export function SimpleButton() {
  return <button>Click me</button>;
}

// ✅ Good - needs browser APIs
'use client';
export function AnalyticsButton() {
  const handleClick = () => {
    window.gtag('event', 'click');
  };
  return <button onClick={handleClick}>Track me</button>;
}
```

### When should I use `{ ssr: false }` with next/dynamic?

Use `{ ssr: false }` for components that:

- ✅ Use browser-only APIs (canvas, WebGL, etc.)
- ✅ Are heavy and not critical for SEO (charts, editors)
- ✅ Cause SSR errors with third-party libraries
- ❌ **Don't** use for: navigation, content, forms, anything SEO-critical

### How do I handle shared utilities between SSR and CSR?

**Pattern**: Runtime detection

```typescript
// utils/browser.ts
export function getBrowserInfo() {
  if (typeof window === 'undefined') {
    return { userAgent: 'server', width: 0 };
  }
  return {
    userAgent: navigator.userAgent,
    width: window.innerWidth
  };
}
```

Or split utilities:

```
utils/
├── shared/     # SSR-safe utils
├── client/     # Browser-only utils
└── server/     # Server-only utils
```

### What's the best way to handle hydration mismatches?

**Option 1: useEffect (Recommended)**
```tsx
function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Skeleton />;

  return <div>{window.innerWidth}</div>;
}
```

**Option 2: Suppress warning (use sparingly)**
```tsx
<div suppressHydrationWarning>
  {typeof window !== 'undefined' ? window.innerWidth : 0}
</div>
```

**Option 3: CSS-only solution**
```tsx
<div className="mobile:block desktop:hidden">Mobile</div>
<div className="mobile:hidden desktop:block">Desktop</div>
```

---

## Performance

### Does SSR Doctor slow down development?

No. ESLint runs in the background in your IDE and only lints changed files.

### Can I run SSR Doctor on only changed files in CI?

Yes! See [docs/guide.md](./guide.md#selective-module-scanning) for strategies.

```bash
# Scan only changed files
git diff --name-only origin/main | grep -E '\.(ts|tsx)$' | xargs ssr-doctor check
```

### How do I optimize for large monorepos?

See the [Monorepo Guide](./guide.md) for:

- Parallel scanning
- Path-based filtering
- Workspace-level configs
- Incremental adoption

---

## Troubleshooting

### How do I debug ESLint rules?

**Enable debug mode:**

```bash
DEBUG=eslint:* npx eslint src/
```

**Check rule is enabled:**

```bash
npx eslint --print-config src/component.tsx | grep ssr-doctor
```

**Verify plugin is loaded:**

```bash
npx eslint --debug src/component.tsx 2>&1 | grep ssr-doctor
```

### Where can I get help?

1. **Documentation**: [README.md](../README.md), [Guide](./guide.md)
2. **Issues**: [GitHub Issues](https://github.com/wangzhe-dev/ssr-doctorjs/issues)
3. **Discussions**: [GitHub Discussions](https://github.com/wangzhe-dev/ssr-doctorjs/discussions)
4. **Examples**: [examples/next-app](../examples/next-app)

### How do I report a bug?

Open an issue with:

1. **Minimal reproduction**: Smallest code that reproduces the issue
2. **Configuration**: Share `.eslintrc.json`
3. **Environment**:
   ```bash
   node --version
   npm list @ssr-doctor/eslint-plugin
   npm list eslint
   ```
4. **Expected vs actual behavior**

---

## Contributing

### How can I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:

- Setting up development environment
- Running tests
- Submitting PRs
- Adding new rules

### Can I add a new rule?

Yes! Open an issue first to discuss:

1. **Problem**: What SSR issue does it catch?
2. **Examples**: Show bad vs good code
3. **Detection strategy**: How to identify the issue
4. **False positive risks**: Edge cases

---

## Version & Compatibility

### What Next.js versions are supported?

- ✅ **Next.js 13+** (App Router): Full support
- ✅ **Next.js 12** (Pages Router): Full support
- ⚠️ **Next.js 11 and below**: Basic support

### What React versions are supported?

- ✅ **React 18+**: Full support
- ✅ **React 17**: Full support
- ⚠️ **React 16**: Basic support

### What ESLint versions are supported?

- ✅ **ESLint 8.x**: Full support
- ⚠️ **ESLint 9.x**: Experimental support
- ❌ **ESLint 7.x and below**: Not supported

---

**Can't find your question?** [Ask on GitHub Discussions](https://github.com/wangzhe-dev/ssr-doctorjs/discussions)
