# @ssr-doctor/cli

Command-line tool for detecting SSR compatibility issues in your React/Next.js projects.

## Installation

```bash
npm install -g @ssr-doctor/cli
# or
pnpm add -g @ssr-doctor/cli
```

## Usage

### Scan your project

```bash
ssr-doctor scan
ssr-doctor scan --path ./src
ssr-doctor scan --format json
```

### Check specific files

```bash
ssr-doctor check src/components/Header.tsx
ssr-doctor check src/**/*.tsx --fix
```

## Commands

### `scan`

Scan your entire codebase for SSR issues.

**Options:**
- `-p, --path <path>` - Path to scan (default: `./src`)
- `-f, --format <format>` - Output format: `text` or `json` (default: `text`)

### `check`

Check specific files for SSR issues.

**Options:**
- `--fix` - Attempt to fix issues automatically (coming soon)

## What it detects

- Direct `window` usage without typeof check
- Direct `document` usage without typeof check
- Direct `localStorage` usage without typeof check
- Direct `sessionStorage` usage without typeof check
- Direct `navigator` usage without typeof check

## Example output

```
⚠ Found 3 SSR issue(s) in 2 file(s):

src/components/Header.tsx:
  12:15 window - Direct window usage detected
    const width = window.innerWidth;

  24:8 localStorage - Direct localStorage usage detected
    localStorage.setItem('theme', 'dark');

💡 Tip: Use 'typeof window !== "undefined"' to check for browser environment
```

## License

MIT
