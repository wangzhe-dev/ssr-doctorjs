# SSR Doctor - Auto-Fix Codemods

Automated code transformations to fix common SSR compatibility issues in Next.js applications.

## Prerequisites

```bash
# Install dependencies (from repo root)
pnpm add -D ts-node typescript ts-morph glob @types/glob
```

## Usage

### Run all codemods at once

```bash
pnpm ts-node scripts/codemods/run-all.ts
```

### Run individual codemods

```bash
# Ensure next/dynamic has { ssr: false }
pnpm ts-node scripts/codemods/ensure-dynamic-ssr-false.ts

# Wrap browser API access with typeof window guards
pnpm ts-node scripts/codemods/wrap-browser-api-guards.ts

# Move Date.now()/Math.random() from render to useEffect
pnpm ts-node scripts/codemods/render-unstable-to-effect.ts

# Flag document.getElementById for manual conversion to refs
pnpm ts-node scripts/codemods/getElementById-to-ref.ts
```

## What Each Codemod Does

### 1. `ensure-dynamic-ssr-false.ts`

Ensures client-only components imported with `next/dynamic` have `{ ssr: false }`.

**Before:**
```tsx
const Chart = dynamic(() => import('./Chart'));
```

**After:**
```tsx
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

### 2. `wrap-browser-api-guards.ts`

Wraps direct browser API access with `typeof window` guards.

**Before:**
```tsx
function Component() {
  const width = window.innerWidth;
  return <div>Width: {width}</div>;
}
```

**After:**
```tsx
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

### 3. `render-unstable-to-effect.ts`

Moves non-deterministic values (Date.now, Math.random) from render to useEffect.

**Before:**
```tsx
function Component() {
  return <div>Time: {Date.now()}</div>;
}
```

**After:**
```tsx
function Component() {
  const [nowTs, setNowTs] = useState<any>(null);
  useEffect(() => { setNowTs(Date.now()); }, []);
  return <div>Time: {nowTs ?? '...'}</div>;
}
```

### 4. `getElementById-to-ref.ts`

Flags `document.getElementById` calls for manual conversion to React refs.

**Before:**
```tsx
function Component() {
  const el = document.getElementById('myId');
  // use el...
}
```

**After:**
```tsx
function Component() {
  // TODO(SSR-Doctor): const elRef = useRef<HTMLElement | null>(null);
  const el = /* TODO(SSR-Doctor): replace with ref */ null;
  // use el...
}
```

## Workflow

1. **Run codemods**
   ```bash
   pnpm ts-node scripts/codemods/run-all.ts
   ```

2. **Review changes**
   ```bash
   git diff
   ```

3. **Address TODOs**
   - Search for `TODO(SSR-Doctor)` in your codebase
   - Manually refactor complex cases
   - Use the SSR-safe utilities and hooks provided in `examples/next-app/src/lib` and `examples/next-app/src/hooks`

4. **Test**
   ```bash
   pnpm build
   pnpm test
   # Check for hydration warnings in browser console
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "feat(ssr): apply SSR auto-fixes"
   ```

## Safety

- Codemods only transform **simple, unambiguous patterns**
- Complex cases are marked with `TODO(SSR-Doctor)` comments
- All changes are reversible via git
- **Always review** the changes before committing

## Limitations

- Only handles straightforward patterns
- Does not fix all SSR issues automatically
- Some manual follow-up required for complex cases
- TypeScript type errors may require adjustment after transformation

## Manual Follow-up Checklist

After running codemods, search for `TODO(SSR-Doctor)` and:

- [ ] Replace `getElementById` with refs attached to JSX
- [ ] Replace `undefined as any` placeholders with proper SSR defaults
- [ ] Consider using custom hooks instead of inline guards:
  - `useMountedValue()` for one-time client values
  - `useMediaQuery()` for media queries
  - `isBrowser()` / `safeWindow()` for utilities
- [ ] Add `'use client'` directive to files with client-only hooks
- [ ] Ensure first render is identical on server and client

## Support

For issues or questions:
- GitHub Issues: https://github.com/wangzhe-dev/ssr-doctorjs/issues
- Documentation: See main README.md
