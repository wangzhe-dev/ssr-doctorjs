# Release Process

This document describes the automated release process for SSR Doctor packages.

---

## Overview

SSR Doctor uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning and publishing. The release process is triggered automatically when commits are pushed to the `main` branch.

### Packages

- **@ssr-doctor/eslint-plugin**: Published to npm
- **@ssr-doctor/cli**: Published to npm
- **@ssr-doctor/action**: NOT published to npm (GitHub Action only)

---

## How It Works

### 1. Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature (triggers **minor** version bump)
- `fix`: Bug fix (triggers **patch** version bump)
- `docs`: Documentation changes (no version bump)
- `chore`: Maintenance (no version bump)
- `refactor`: Code refactoring (no version bump)
- `test`: Test changes (no version bump)
- `ci`: CI configuration (no version bump)

**Scopes:**
- `eslint-plugin`: Changes to ESLint plugin
- `cli`: Changes to CLI
- `action`: Changes to GitHub Action
- `deps`: Dependency updates
- `release`: Release configuration
- `docs`: Documentation

**Breaking Changes:**

Include `BREAKING CHANGE:` in the commit footer to trigger a **major** version bump:

```
feat(eslint-plugin): add new rule

BREAKING CHANGE: The old rule has been removed
```

### 2. Commitlint

Commitlint enforces the Conventional Commits format via a git hook:

```bash
# This will fail if commit message is invalid
git commit -m "invalid commit message"

# This will succeed
git commit -m "feat(eslint-plugin): add new detection"
```

**Hook location:** `.husky/commit-msg`

### 3. Semantic Release

When commits are pushed to `main`:

1. **Analyze commits**: Determine version bump based on commit types
2. **Generate changelog**: Create CHANGELOG.md from commits
3. **Update versions**: Bump version in package.json files
4. **Build packages**: Run `pnpm build`
5. **Publish to npm**: Publish packages with NPM_TOKEN
6. **Create GitHub release**: Tag and create release with notes
7. **Commit changes**: Update CHANGELOG.md and package.json

**Configuration files:**
- Root: `.releaserc.json` (monorepo coordination)
- ESLint plugin: `packages/eslint-plugin-ssr-doctor/.releaserc.json`
- CLI: `packages/cli/.releaserc.json`

---

## Release Workflow

### Automatic Release (Recommended)

1. **Develop on feature branch:**
   ```bash
   git checkout -b feat/my-feature
   # Make changes
   git add .
   git commit -m "feat(eslint-plugin): add new rule"
   git push origin feat/my-feature
   ```

2. **Create Pull Request:**
   - CI runs tests and builds
   - Review and approve

3. **Merge to main:**
   ```bash
   git checkout main
   git merge feat/my-feature
   git push origin main
   ```

4. **Automatic release:**
   - GitHub Actions runs release workflow
   - semantic-release analyzes commits
   - Version is bumped and published
   - GitHub release is created
   - npm packages are updated

### Manual Release (Development/Testing)

**Dry run (test without publishing):**

```bash
pnpm release:dry
```

**Release specific package:**

```bash
# ESLint plugin only
pnpm release:eslint-plugin

# CLI only
pnpm release:cli
```

---

## Package Name Fallback

If `@ssr-doctor/eslint-plugin` or `@ssr-doctor/cli` are already taken on npm:

```bash
# Check availability
pnpm check:names
```

The script will automatically:
1. Check if `@ssr-doctor/*` names are available
2. If taken, check `@ssr-doctorjs/*` fallbacks
3. Update package.json files if needed
4. Report results

**Fallback names:**
- `@ssr-doctor/eslint-plugin` → `@ssr-doctorjs/eslint-plugin`
- `@ssr-doctor/cli` → `@ssr-doctorjs/cli`

If both are taken, manual intervention is required.

---

## First Release

### Prerequisites

1. **NPM Account:**
   - Create account at https://www.npmjs.com/
   - Generate access token (Automation token)
   - Add to GitHub Secrets as `NPM_TOKEN`

2. **GitHub Secrets:**
   ```
   Settings → Secrets and variables → Actions → New repository secret

   Name: NPM_TOKEN
   Value: npm_xxxxxxxxxxxxxxxxxxxx
   ```

3. **Package Names:**
   ```bash
   # Check if names are available
   pnpm check:names
   ```

### Steps

1. **Prepare for first release:**
   ```bash
   # Ensure all tests pass
   pnpm test

   # Ensure build succeeds
   pnpm build

   # Check package names
   pnpm check:names
   ```

2. **Create initial release commit:**
   ```bash
   git checkout -b feat/initial-release

   # Make any final changes
   git add .
   git commit -m "feat(eslint-plugin): initial release with 3 core rules

   - no-browser-api-in-ssr: Detect browser APIs in SSR contexts
   - dynamic-ssr-flag: Enforce ssr: false in next/dynamic
   - hydration-risk-useeffect: Prevent hydration mismatches

   BREAKING CHANGE: Initial release"

   git push origin feat/initial-release
   ```

3. **Create Pull Request and merge to main**

4. **Verify release:**
   - Check GitHub Actions: https://github.com/wangzhe-dev/ssr-doctorjs/actions
   - Check npm:
     - https://www.npmjs.com/package/@ssr-doctor/eslint-plugin
     - https://www.npmjs.com/package/@ssr-doctor/cli
   - Check GitHub Releases: https://github.com/wangzhe-dev/ssr-doctorjs/releases

---

## Version Strategy

semantic-release determines versions based on commits since last release:

| Commits | Version Bump | Example |
|---------|--------------|---------|
| `fix:` only | Patch | 0.1.0 → 0.1.1 |
| `feat:` | Minor | 0.1.0 → 0.2.0 |
| `BREAKING CHANGE:` | Major | 0.1.0 → 1.0.0 |
| `docs:`, `chore:` | None | 0.1.0 → 0.1.0 |

**Examples:**

```bash
# Patch: 0.1.0 → 0.1.1
git commit -m "fix(eslint-plugin): correct false positive in typeof guard"

# Minor: 0.1.0 → 0.2.0
git commit -m "feat(cli): add JSON output format"

# Major: 0.1.0 → 1.0.0
git commit -m "feat(eslint-plugin): redesign rule API

BREAKING CHANGE: Old configuration format no longer supported"

# Multiple commits: Highest version bump wins
git commit -m "feat(cli): add new command"
git commit -m "fix(eslint-plugin): fix typo"
# Result: Minor bump (0.1.0 → 0.2.0)
```

---

## Troubleshooting

### Release Fails: "ENOENT: no such file or directory, open 'dist/index.js'"

**Cause:** Build artifacts missing

**Solution:**
```bash
pnpm build
git add .
git commit -m "chore(release): add build artifacts"
```

### Release Fails: "401 Unauthorized"

**Cause:** Invalid NPM_TOKEN

**Solution:**
1. Generate new token at https://www.npmjs.com/settings/tokens
2. Update GitHub Secret `NPM_TOKEN`
3. Re-run workflow

### Release Fails: "Package name already exists"

**Cause:** `@ssr-doctor/*` names taken

**Solution:**
```bash
pnpm check:names
# Commit updated package.json files
git add .
git commit -m "chore(release): use fallback package names"
```

### No Version Bump

**Cause:** No `feat:` or `fix:` commits since last release

**Solution:**
- Ensure commits follow Conventional Commits format
- Check commit messages in the range since last tag

### Multiple Packages Released with Wrong Versions

**Cause:** Incorrect tag format in `.releaserc.json`

**Solution:**
- Verify `tagFormat` in each package's `.releaserc.json`
- ESLint plugin: `"tagFormat": "eslint-plugin-v${version}"`
- CLI: `"tagFormat": "cli-v${version}"`

---

## CI/CD Integration

### GitHub Actions

**.github/workflows/release.yml:**

```yaml
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4

      - name: Install & Build
        run: |
          pnpm install
          pnpm build
          pnpm test

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm release
```

### Manual Trigger (Optional)

Add workflow_dispatch to allow manual releases:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # Manual trigger
```

---

## Versioning Examples

### Example 1: Bug Fix Release

```bash
# Current version: 0.1.0
git commit -m "fix(eslint-plugin): resolve false positive in window detection"
git push origin main

# Released: 0.1.1
```

### Example 2: Feature Release

```bash
# Current version: 0.1.1
git commit -m "feat(cli): add --format=sarif option for security scanning"
git push origin main

# Released: 0.2.0
```

### Example 3: Breaking Change

```bash
# Current version: 0.2.0
git commit -m "feat(eslint-plugin): redesign configuration API

BREAKING CHANGE: Config format changed from array to object"
git push origin main

# Released: 1.0.0
```

### Example 4: Multiple Changes

```bash
# Current version: 1.0.0
git commit -m "fix(cli): correct exit code"
git commit -m "feat(eslint-plugin): add new rule"
git commit -m "docs: update README"
git push origin main

# Released: 1.1.0 (highest bump wins)
```

---

## Best Practices

### 1. Atomic Commits

Make small, focused commits:

```bash
# Good
git commit -m "feat(eslint-plugin): add no-localstorage rule"
git commit -m "test(eslint-plugin): add tests for no-localstorage"
git commit -m "docs(eslint-plugin): document no-localstorage rule"

# Bad
git commit -m "feat: add everything"
```

### 2. Descriptive Messages

Include context in commit body:

```bash
git commit -m "feat(cli): add --ignore option

Allows users to exclude specific files or directories from scanning.
Supports glob patterns like **/*.test.ts

Closes #42"
```

### 3. Test Before Pushing

```bash
# Always test locally first
pnpm build
pnpm test
pnpm lint

# Then push
git push origin main
```

### 4. Use Branches

Never commit directly to `main`:

```bash
# Create feature branch
git checkout -b feat/my-feature

# Work and commit
git commit -m "feat(cli): add new feature"

# Push and create PR
git push origin feat/my-feature
```

---

## Maintenance

### Update Release Configuration

To modify release behavior, edit:

- `.releaserc.json` (root)
- `packages/eslint-plugin-ssr-doctor/.releaserc.json`
- `packages/cli/.releaserc.json`

### Add New Package

1. Create package in `packages/`
2. Add `.releaserc.json` with unique `tagFormat`
3. Update root `package.json` with release script
4. Add to `.github/workflows/release.yml`

### Skip CI

To prevent release on certain commits:

```bash
git commit -m "docs: update README [skip ci]"
```

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release](https://github.com/semantic-release/semantic-release)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)
- [npm Documentation](https://docs.npmjs.com/)

---

## Support

If you encounter issues:

1. Check [GitHub Actions logs](https://github.com/wangzhe-dev/ssr-doctorjs/actions)
2. Review [semantic-release docs](https://semantic-release.gitbook.io/)
3. Open an [issue](https://github.com/wangzhe-dev/ssr-doctorjs/issues)
