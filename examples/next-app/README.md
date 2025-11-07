# Next.js Example App

This is a demo Next.js application showcasing SSR compatibility issues and how to fix them.

## What's included

- **BadComponent**: Contains multiple SSR issues that will be detected by SSR Doctor
- **GoodComponent**: Shows the correct way to handle browser APIs in SSR environments

## SSR Issues Demonstrated

The `BadComponent` contains these common SSR issues:

1. Direct `window.innerWidth` usage
2. Direct `document.title` usage
3. Direct `localStorage.getItem()` usage
4. Direct `sessionStorage.getItem()` usage
5. Direct `navigator.userAgent` usage
6. Window event listeners without proper checks

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
../../packages/cli/dist/cli.js scan --path ./src
```

## Expected ESLint output

ESLint with the `@ssr-doctor/eslint-plugin` should flag all the issues in `BadComponent.tsx`.

## Learning points

1. Always check `typeof window !== 'undefined'` before using browser APIs
2. Use `useEffect` for browser-only code
3. Provide fallback values for SSR
4. Use the `'use client'` directive when necessary in Next.js App Router
