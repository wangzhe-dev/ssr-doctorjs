# SSR Doctor

A comprehensive toolset for detecting and preventing SSR compatibility issues in React applications.

## Overview

SSR Doctor helps you identify and fix common server-side rendering issues before they reach production. This monorepo contains:

- **eslint-plugin-ssr-doctor**: ESLint plugin to catch SSR issues during development
- **ssr-doctor CLI**: Command-line tool for scanning and analyzing your codebase
- **ssr-doctor GitHub Action**: Automated SSR checks in your CI/CD pipeline

## Packages

### [@ssr-doctor/eslint-plugin](./packages/eslint-plugin-ssr-doctor)

ESLint plugin with rules to detect:
- Browser-only API usage (window, document, localStorage, etc.)
- Improper useEffect dependencies
- Client-only hooks usage in server components
- And more...

### [@ssr-doctor/cli](./packages/cli)

Command-line interface for scanning projects:
```bash
npx ssr-doctor scan
npx ssr-doctor check --fix
```

### [@ssr-doctor/action](./packages/action)

GitHub Action for automated checks:
```yaml
- uses: ssr-doctor/action@v1
  with:
    path: ./src
```

## Quick Start

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Development

This project uses:
- **pnpm workspaces** for monorepo management
- **TypeScript** for type safety
- **Vitest** for testing
- **tsup** for building
- **semantic-release** for automated releases

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT - see [LICENSE](./LICENSE)
