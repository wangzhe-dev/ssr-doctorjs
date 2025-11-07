# SSR Doctor - Quick Optimization Reference

Quick guide for developers to fix common SSR issues.

## Common SSR Issues & Fixes

### 1. Window/Document Access

❌ **Wrong:**
```tsx
const width = window.innerWidth;
const el = document.getElementById('id');
```

✅ **Right:**
```tsx
import { useMountedValue } from '@/hooks';

const width = useMountedValue(() => window.innerWidth, 0);
const elRef = useRef<HTMLDivElement>(null);
// Use ref in JSX: <div ref={elRef}>...</div>
```

### 2. Client-Only Components

❌ **Wrong:**
```tsx
import Chart from './Chart'; // Uses window/canvas
```

✅ **Right:**
```tsx
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

### 3. Non-Deterministic Values

❌ **Wrong:**
```tsx
<div>{Date.now()}</div>
<div>{Math.random()}</div>
```

✅ **Right:**
```tsx
const [time, setTime] = useState<number | null>(null);
useEffect(() => setTime(Date.now()), []);
<div>{time ?? 'Loading...'}</div>
```

### 4. localStorage/sessionStorage

❌ **Wrong:**
```tsx
const theme = localStorage.getItem('theme');
```

✅ **Right:**
```tsx
import { safeWindow } from '@/lib/runtime';

const theme = safeWindow(() => localStorage.getItem('theme'), 'light');
```

### 5. Media Queries

❌ **Wrong:**
```tsx
const isMobile = window.matchMedia('(max-width: 768px)').matches;
```

✅ **Right:**
```tsx
import { useMediaQuery } from '@/hooks';

const isMobile = useMediaQuery('(max-width: 768px)', false);
```

### 6. User Agent Detection

❌ **Wrong:**
```tsx
const ua = navigator.userAgent;
```

✅ **Right:**
```tsx
import { safeUA } from '@/lib/runtime';

const ua = safeUA('unknown');
```

## Quick Commands

```bash
# Auto-fix common issues
pnpm codemod

# Check for SSR issues
pnpm ssr-doctor scan

# Find manual fixes needed
grep -r "TODO(SSR-Doctor)" examples/

# Test SSR build
pnpm build && pnpm start
```

## Checklist Before Deploy

- [ ] No `window`/`document` access in Server Components
- [ ] All client-only imports use `dynamic(() => ..., { ssr: false })`
- [ ] No hydration warnings in browser console
- [ ] First render identical on server and client
- [ ] All components have `'use client'` if using hooks
- [ ] No `Date.now()`/`Math.random()` in JSX
- [ ] Build succeeds: `pnpm build`
- [ ] ESLint passes: `pnpm lint`

## Common Patterns

### Pattern: Feature Detection

```tsx
import { safeWindow } from '@/lib/runtime';

const supportsWebP = safeWindow(
  () => document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
  false
);
```

### Pattern: Conditional Client Code

```tsx
import { isBrowser } from '@/lib/runtime';

if (isBrowser()) {
  // Safe to use window/document here
  window.addEventListener('scroll', handleScroll);
}
```

### Pattern: SSR-Safe State

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return null; // Skip SSR
return <ClientOnlyContent />;
```

## Utilities Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `isBrowser()` | Check if running on client | `if (isBrowser()) { ... }` |
| `isServer()` | Check if running on server | `if (isServer()) { ... }` |
| `safeUA(default)` | Get user agent safely | `safeUA('bot')` |
| `safeWindow(fn, fallback)` | Access window safely | `safeWindow(() => innerWidth, 0)` |
| `useMountedValue(fn, init)` | Get client value after mount | `useMountedValue(() => Date.now(), 0)` |
| `useMediaQuery(q, ssr)` | Media query with SSR support | `useMediaQuery('(min-width: 768px)', false)` |

## Need Help?

- 📖 Full Guide: [AUTO_FIX_GUIDE.md](./AUTO_FIX_GUIDE.md)
- 🔧 Codemod Docs: [scripts/codemods/README.md](../scripts/codemods/README.md)
- 🐛 Issues: https://github.com/wangzhe-dev/ssr-doctorjs/issues
