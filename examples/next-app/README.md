# Next.js Example App

This is a demo Next.js application showcasing SSR compatibility issues and how to fix them using SSR Doctor.

## What's included

### Example Pages

- **`app/page.tsx`** - Home page with good and bad examples
- **`app/violations/page.tsx`** - Intentional SSR violations for testing
- **`app/dynamic-examples/page.tsx`** - Dynamic import examples

### Example Components

- **BadComponent**: Contains multiple SSR issues (legacy example)
- **GoodComponent**: Shows the correct way to handle browser APIs
- **ViolationExamples**: Demonstrates various SSR violation patterns
- **DynamicImportViolations**: Shows incorrect and correct dynamic import usage

## SSR Rules Demonstrated

### 1. no-browser-api-in-ssr

Detects direct browser API usage in SSR contexts:

```tsx
// ❌ Bad: Direct usage in server component
export default function Page() {
  const width = window.innerWidth; // ERROR
  const ua = navigator.userAgent; // ERROR
  return <div>{width}</div>;
}

// ✅ Good: With typeof guard
export default function Page() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  return <div>{width}</div>;
}
```

### 2. dynamic-ssr-flag

Enforces `{ ssr: false }` for dynamic imports:

```tsx
// ❌ Bad: Missing ssr: false
const Component = dynamic(() => import('./ClientComponent'));

// ✅ Good: With ssr: false
const Component = dynamic(() => import('./ClientComponent'), {
  ssr: false,
});
```

### 3. hydration-risk-useeffect

Prevents hydration mismatches from browser API usage during render:

```tsx
// ❌ Bad: Browser API in render
function Component() {
  const width = window.innerWidth; // ERROR: Hydration mismatch!
  return <div>{width}</div>;
}

// ✅ Good: Move to useEffect
function Component() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  return <div>{width}</div>;
}
```

## Running the example

```bash
# From the monorepo root
pnpm install
pnpm build

# Navigate to this directory
cd examples/next-app

# Run development server
pnpm dev

# Run ESLint to see detected issues
pnpm lint

# Run SSR Doctor CLI
npx @ssr-doctor/cli scan --path ./src
```

## Expected ESLint output

When you run `pnpm lint`, ESLint with the `@ssr-doctor/eslint-plugin` will flag:

1. **Multiple violations in `app/violations/page.tsx`**:
   - Direct `navigator.userAgent` usage
   - Direct `window.innerWidth` usage

2. **Violations in `components/ViolationExamples.tsx`**:
   - `HydrationRiskExample`: window usage without useEffect
   - `BrowserAPIViolation`: Multiple browser API violations
   - `MultipleBrowserAPIs`: Various browser globals
   - `ConditionalBrowserAPI`: Browser API in render logic

3. **Violations in `components/DynamicImportViolations.tsx`**:
   - Missing `{ ssr: false }` on dynamic imports

## Intentional Violations

This example app contains **intentional violations** to demonstrate SSR Doctor's detection capabilities:

- `src/app/violations/page.tsx` - Server component with browser API usage
- `src/components/ViolationExamples.tsx` - Various violation patterns
- `src/components/DynamicImportViolations.tsx` - Dynamic import issues

## Learning points

1. **Always use typeof guards** before accessing browser APIs in code that runs on the server
2. **Move browser API calls to useEffect** to avoid hydration mismatches
3. **Use `{ ssr: false }` with next/dynamic** for client-only components
4. **Use the `'use client'` directive** when the entire component needs browser APIs
5. **Test with SSR Doctor** to catch issues before they reach production

## Browser APIs Detected

SSR Doctor detects usage of these browser globals:

- `window`, `document`, `navigator`, `location`
- `localStorage`, `sessionStorage`, `history`
- `HTMLElement`, `Node`, `Event`, `Image`
- And many more...

## Auto-fix Support

Some rules support auto-fix:

```bash
# Auto-fix dynamic-ssr-flag violations
pnpm lint --fix
```

The `dynamic-ssr-flag` rule can automatically add `{ ssr: false }` to dynamic imports.
