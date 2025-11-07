# Contributing to SSR Doctor

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Prerequisites**
   - Node.js >= 18
   - pnpm >= 8

2. **Installation**
   ```bash
   git clone <repository-url>
   cd ssr-doctorjs
   pnpm install
   ```

3. **Building**
   ```bash
   pnpm build
   ```

4. **Testing**
   ```bash
   pnpm test
   ```

## Project Structure

```
ssr-doctorjs/
├── packages/
│   ├── eslint-plugin-ssr-doctor/  # ESLint plugin
│   ├── cli/                        # Command-line tool
│   └── action/                     # GitHub Action
├── examples/
│   └── next-app/                   # Demo Next.js app
└── ...
```

## Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test your changes**
   ```bash
   pnpm build
   pnpm test
   pnpm lint
   ```

4. **Commit using Conventional Commits**
   ```bash
   git commit -m "feat: add new rule for detecting localStorage usage"
   ```

   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `test`: Test changes
   - `chore`: Maintenance tasks
   - `refactor`: Code refactoring
   - `perf`: Performance improvements

5. **Submit a pull request**

## Code Style

- Use TypeScript for all new code
- Follow the existing ESLint and Prettier configuration
- Write tests for new features
- Update documentation as needed

## Adding New ESLint Rules

1. Create rule file in `packages/eslint-plugin-ssr-doctor/src/rules/`
2. Add tests in `packages/eslint-plugin-ssr-doctor/tests/rules/`
3. Export rule in `packages/eslint-plugin-ssr-doctor/src/index.ts`
4. Update documentation

## Release Process

Releases are automated using semantic-release based on commit messages. When commits are merged to the main branch:

- `feat:` triggers a minor version bump
- `fix:` triggers a patch version bump
- `BREAKING CHANGE:` triggers a major version bump

## Questions?

Feel free to open an issue for any questions or concerns.
