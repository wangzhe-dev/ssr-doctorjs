# @ssr-doctor/core

Core detection engine for SSR Doctor - shared by CLI and GitHub Action packages.

## Features

- 🎯 **Zero Dependencies**: Pure TypeScript implementation
- ⚡ **High Performance**: Regex caching and optimized detection algorithms
- 🔍 **Comprehensive Detection**: 25+ browser APIs, hydration risks, dynamic imports
- 🛡️ **Type Safe**: Full TypeScript support with exported types

## Installation

```bash
npm install @ssr-doctor/core
# or
pnpm add @ssr-doctor/core
```

## Usage

```typescript
import { detectSSRIssues, getIssueStats } from '@ssr-doctor/core';

// Detect issues in a file
const issues = detectSSRIssues('./src/components/Header.tsx');

// Get statistics
const stats = getIssueStats(issues);
console.log(`Found ${stats.total} issues (${stats.errors} errors, ${stats.warnings} warnings)`);
```

## API

### `detectSSRIssues(filePath: string): SSRIssue[]`

Detects SSR compatibility issues in a given file.

**Parameters:**
- `filePath`: Absolute path to the file to analyze

**Returns:**
- Array of `SSRIssue` objects

### `getIssueStats(issues: SSRIssue[])`

Calculates statistics from a list of issues.

**Returns:**
- `total`: Total number of issues
- `errors`: Number of errors
- `warnings`: Number of warnings
- `byType`: Issues grouped by type
- `files`: Number of unique files with issues

### `SSRIssue` Interface

```typescript
interface SSRIssue {
  file: string;
  line: number;
  column: number;
  type: 'browser-api' | 'hydration-risk' | 'dynamic-ssr';
  severity: 'error' | 'warning';
  api: string;
  message: string;
  code: string;
  suggestion?: string;
}
```

## License

MIT
