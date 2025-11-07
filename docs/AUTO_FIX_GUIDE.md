# SSR Doctor - Auto-Fix Guide

SSR Doctor includes automated code transformations (codemods) to fix common SSR compatibility issues in Next.js applications.

## Quick Start

```bash
# Install codemod dependencies
pnpm install

# Run all auto-fixes
pnpm codemod

# Or run individual codemods
pnpm codemod:dynamic  # Fix next/dynamic imports
pnpm codemod:guards   # Add typeof window guards
pnpm codemod:unstable # Move Date.now/Math.random to useEffect
pnpm codemod:refs     # Flag getElementById for manual fixes
```

## What Gets Fixed Automatically

### 1. Next.js Dynamic Imports

**Problem**: Client-only components without `{ ssr: false }` cause SSR errors.

**Auto-fix**: Adds `{ ssr: false }` to `next/dynamic` calls.

```tsx
// Before
const Chart = dynamic(() => import('./Chart'));

// After
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

### 2. Browser API Access

**Problem**: Direct access to `window`, `document`, etc. crashes during SSR.

**Auto-fix**: Wraps browser API access with `typeof window` guards.

```tsx
// Before
function Component() {
  const width = window.innerWidth;
  return <div>Width: {width}</div>;
}

// After
function Component() {
  let width = undefined as any;
  if (typeof window !== 'undefined') { width = window.innerWidth; }
  return <div>Width: {width}</div>;
}
```

**Better approach** (manual follow-up):
```tsx
'use client';
import { useMountedValue } from '@/hooks';

function Component() {
  const width = useMountedValue(() => window.innerWidth, 0);
  return <div>Width: {width}</div>;
}
```

### 3. Non-Deterministic Render Values

**Problem**: `Date.now()` and `Math.random()` in JSX cause hydration mismatches.

**Auto-fix**: Moves unstable values to `useEffect` + `useState`.

```tsx
// Before
function Component() {
  return <div>Time: {Date.now()}</div>;
}

// After
function Component() {
  const [nowTs, setNowTs] = useState<any>(null);
  useEffect(() => { setNowTs(Date.now()); }, []);
  return <div>Time: {nowTs ?? '...'}</div>;
}
```

### 4. DOM Element Access

**Problem**: `document.getElementById` doesn't exist during SSR.

**Auto-fix**: Adds TODO markers for manual conversion to React refs.

```tsx
// Before
function Component() {
  const el = document.getElementById('myId');
  // use el...
}

// After
function Component() {
  // TODO(SSR-Doctor): const elRef = useRef<HTMLElement | null>(null);
  const el = /* TODO(SSR-Doctor): replace with ref */ null;
  // use el...
}
```

## SSR-Safe Utilities & Hooks

After running codemods, you can improve the auto-generated code using these utilities:

### Runtime Detection

```tsx
import { isBrowser, isServer, safeUA, safeWindow } from '@/lib/runtime';

// Check environment
if (isBrowser()) {
  console.log('Running on client');
}

// Get user agent safely
const ua = safeUA('bot'); // Returns 'bot' during SSR

// Access window properties safely
const width = safeWindow(() => window.innerWidth, 0);
```

### Custom Hooks

```tsx
import { useMountedValue, useMediaQuery } from '@/hooks';

function Component() {
  // Get client-only values after mount
  const width = useMountedValue(() => window.innerWidth, 0);
  
  // Media queries with SSR support
  const isMobile = useMediaQuery('(max-width: 768px)', true);
  
  return (
    <div>
      Width: {width}px
      {isMobile && <MobileMenu />}
    </div>
  );
}
```

## Workflow

### 1. Run Codemods

```bash
pnpm codemod
```

Review the console output to see what was changed.

### 2. Review Changes

```bash
git diff
```

Carefully review all transformations. The codemods are conservative and only handle simple cases.

### 3. Address TODOs

Search for `TODO(SSR-Doctor)` in your codebase:

```bash
grep -r "TODO(SSR-Doctor)" examples/
```

Manually refactor complex cases flagged by the codemods.

### 4. Improve Auto-Generated Code

Replace basic guards with proper SSR-safe patterns:

```tsx
// Auto-generated (basic)
let width = undefined as any;
if (typeof window !== 'undefined') { width = window.innerWidth; }

// Improved (using hooks)
const width = useMountedValue(() => window.innerWidth, 0);
```

### 5. Test

```bash
# Build to check for TypeScript errors
pnpm build

# Run tests
pnpm test

# Start dev server and check browser console for hydration warnings
pnpm dev
```

### 6. Commit

```bash
git add .
git commit -m "feat(ssr): apply automated SSR fixes"
```

## Safety & Limitations

### Safe to Run

- ✅ Only transforms simple, unambiguous patterns
- ✅ All changes are reversible via git
- ✅ Complex cases get TODO markers instead of risky transformations
- ✅ Does not modify external dependencies

### Limitations

- ⚠️ Cannot fix all SSR issues automatically
- ⚠️ Some manual follow-up required
- ⚠️ May introduce `any` types that need refinement
- ⚠️ Does not handle complex control flow
- ⚠️ Does not understand application-specific SSR patterns

### When to Use

- ✅ New Next.js projects migrating from client-only React
- ✅ Projects with many simple SSR violations
- ✅ As a starting point for SSR refactoring
- ✅ To quickly identify SSR issues

### When NOT to Use

- ❌ Production code without testing
- ❌ Projects with complex custom SSR patterns
- ❌ When you need fine-grained control over transformations
- ❌ On code you don't understand

## Troubleshooting

### "Module not found: ts-morph"

```bash
pnpm install
```

### "No files were transformed"

The codemods only scan `examples/next-app/**/*.{ts,tsx,js,jsx}`. Adjust the glob patterns in the codemod scripts if your code is elsewhere.

### TypeScript errors after transformation

The codemods may introduce `any` types. Review and add proper types:

```tsx
// Auto-generated
let width = undefined as any;

// With proper types
let width: number | undefined = undefined;
```

### Hydration warnings persist

Not all hydration issues can be auto-fixed. Common manual fixes:

1. **Server/client data mismatch**: Ensure data fetching is identical
2. **Browser-specific logic in render**: Move to `useEffect`
3. **Third-party components**: Wrap with `dynamic(() => ..., { ssr: false })`
4. **Date formatting**: Use consistent timezone on server and client

## Manual Follow-up Checklist

After running codemods:

- [ ] Search for `TODO(SSR-Doctor)` and address all markers
- [ ] Replace `undefined as any` with proper types
- [ ] Replace inline guards with custom hooks where appropriate
- [ ] Add `'use client'` directive to files using client-only hooks
- [ ] Test SSR rendering: `pnpm build && pnpm start`
- [ ] Check browser console for hydration warnings
- [ ] Verify first render is identical on server and client
- [ ] Run ESLint: `pnpm lint`
- [ ] Update tests if needed

## Advanced Usage

### Custom Glob Patterns

Edit codemod scripts to scan different directories:

```typescript
// scripts/codemods/ensure-dynamic-ssr-false.ts
const files = globSync([
  'src/**/*.{ts,tsx}',           // Adjust this pattern
  '!**/node_modules/**',
  '!**/dist/**',
]);
```

### Dry Run

To see what would change without modifying files:

```bash
# Run and review git diff before committing
pnpm codemod
git diff
git restore .  # Undo if needed
```

### Incremental Adoption

Run individual codemods:

```bash
pnpm codemod:dynamic  # Start with dynamic imports
# Test, commit
pnpm codemod:guards   # Then add guards
# Test, commit
```

## Support

- **Documentation**: See [scripts/codemods/README.md](../scripts/codemods/README.md)
- **Issues**: https://github.com/wangzhe-dev/ssr-doctorjs/issues
- **Examples**: See `examples/next-app/src/` for usage patterns
