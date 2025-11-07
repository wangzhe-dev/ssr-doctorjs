# @ssr-doctor/eslint-plugin

ESLint plugin to detect SSR compatibility issues in React and Next.js applications.

## Installation

```bash
npm install --save-dev @ssr-doctor/eslint-plugin
# or
pnpm add -D @ssr-doctor/eslint-plugin
```

## Usage

Add to your `.eslintrc`:

```json
{
  "extends": ["plugin:@ssr-doctor/recommended"]
}
```

Or configure rules individually:

```json
{
  "plugins": ["@ssr-doctor"],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

## Available Configs

- **`recommended`** - Enables the 3 MVP rules (recommended for most projects)
- **`legacy`** - Enables only the legacy rules (deprecated)
- **`all`** - Enables all rules

## Rules

### MVP Rules (Recommended)

#### `no-browser-api-in-ssr` ⚠️

Prevents usage of browser-only APIs in SSR contexts (Next.js app directory, pages, middleware) without proper guards.

**Detected in:**
- Files in `app/` directory (without `'use client'`)
- Files in `pages/` directory
- `middleware.ts`
- API routes (`route.ts`)

**Browser APIs detected:**
`window`, `document`, `navigator`, `location`, `localStorage`, `sessionStorage`, `history`, `HTMLElement`, `Node`, `Event`, `Image`, and more.

**❌ Bad:**
```tsx
// app/components/Component.tsx
export default function Component() {
  const width = window.innerWidth; // ERROR
  const ua = navigator.userAgent; // ERROR
  return <div>{width}</div>;
}
```

**✅ Good:**
```tsx
// Option 1: Use 'use client' directive
'use client';
export default function Component() {
  const width = window.innerWidth; // OK
  return <div>{width}</div>;
}

// Option 2: Use typeof guard
export default function Component() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  return <div>{width}</div>;
}

// Option 3: Move to useEffect
export default function Component() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  return <div>{width}</div>;
}
```

**Options:**
```json
{
  "@ssr-doctor/no-browser-api-in-ssr": ["error", {
    "allowedAPIs": ["navigator"] // Allow specific APIs
  }]
}
```

---

#### `dynamic-ssr-flag` 🔧

Enforces `{ ssr: false }` option when using `next/dynamic` to import components.

**Auto-fixable:** Yes

**❌ Bad:**
```tsx
import dynamic from 'next/dynamic';

// Missing { ssr: false }
const ClientComponent = dynamic(() => import('./ClientComponent'));
```

**✅ Good:**
```tsx
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
```

**Auto-fix:**
```bash
eslint --fix
```

---

#### `hydration-risk-useeffect` ⚠️

Prevents hydration mismatches by detecting browser API usage during component render. Suggests moving to `useEffect`.

**❌ Bad:**
```tsx
function Component() {
  // This runs during render and causes hydration mismatch
  const width = window.innerWidth;
  const isMobile = width < 768;

  return (
    <div>
      {isMobile ? 'Mobile' : 'Desktop'} {/* Different on server vs client! */}
    </div>
  );
}
```

**✅ Good:**
```tsx
function Component() {
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setWidth(window.innerWidth);
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div>
      {isMobile ? 'Mobile' : 'Desktop'}
    </div>
  );
}
```

**Alternative (with typeof guard):**
```tsx
function Component() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  return <div>{width}</div>;
}
```

---

### Legacy Rules (Deprecated)

These rules are kept for backward compatibility but are superseded by `no-browser-api-in-ssr`:

#### `no-window-usage`

Disallows direct usage of `window` object without SSR check.

#### `no-document-usage`

Disallows direct usage of `document` object without SSR check.

#### `no-localstorage-usage`

Disallows direct usage of `localStorage` without SSR check.

**Note:** Use `no-browser-api-in-ssr` instead, which covers all these cases and more.

---

## Examples

See the [examples/next-app](../../examples/next-app) directory for comprehensive examples of:

- Common SSR violations
- Correct patterns
- Dynamic import usage
- Hydration-safe code

## Integration with Next.js

### Next.js 13+ (App Router)

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@ssr-doctor/recommended"
  ]
}
```

### Next.js Pages Router

```json
// .eslintrc.json
{
  "extends": [
    "next",
    "plugin:@ssr-doctor/recommended"
  ]
}
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Lint
  run: pnpm lint
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix"]
  }
}
```

## Why SSR Doctor?

Server-Side Rendering (SSR) and Static Site Generation (SSG) are powerful techniques, but they come with a caveat: **browser APIs don't exist on the server**.

Common issues SSR Doctor prevents:

1. **Runtime Errors**: `ReferenceError: window is not defined`
2. **Hydration Mismatches**: Content differs between server and client
3. **Build Failures**: SSG fails when browser APIs are accessed during build
4. **Performance Issues**: Improper dynamic imports can bloat bundles

## Browser APIs Detected

- **Window**: `window`, `Window`
- **Document**: `document`, `Document`
- **Navigation**: `navigator`, `location`, `history`
- **Storage**: `localStorage`, `sessionStorage`
- **DOM**: `HTMLElement`, `Node`, `Element`, `Event`
- **Media**: `Image`, `Audio`, `Video`
- **Observers**: `IntersectionObserver`, `MutationObserver`, `ResizeObserver`
- **Performance**: `requestAnimationFrame`, `requestIdleCallback`
- **And many more...**

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT
