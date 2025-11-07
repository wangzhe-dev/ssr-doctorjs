# @ssr-doctor/action

GitHub Action for detecting SSR compatibility issues in your React/Next.js projects.

## Usage

Add this action to your workflow:

```yaml
name: SSR Check

on: [push, pull_request]

jobs:
  ssr-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for SSR issues
        uses: ssr-doctor/action@v1
        with:
          path: ./src
          format: text
          fail-on-error: true
```

## Inputs

### `path`

**Optional** Path to scan for SSR issues. Default: `./src`

### `format`

**Optional** Output format (`text` or `json`). Default: `text`

### `fail-on-error`

**Optional** Whether to fail the action if issues are found. Default: `true`

## Outputs

### `issues-found`

Number of SSR issues found.

### `results`

Scan results in JSON format (when format is set to `json`).

## Example with outputs

```yaml
- name: Check for SSR issues
  id: ssr-check
  uses: ssr-doctor/action@v1
  with:
    path: ./src
    format: json
    fail-on-error: false

- name: Comment on PR
  uses: actions/github-script@v7
  with:
    script: |
      const issues = ${{ steps.ssr-check.outputs.issues-found }};
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `SSR Doctor found ${issues} issue(s)`
      })
```

## What it detects

- Direct `window` usage without typeof check
- Direct `document` usage without typeof check
- Direct `localStorage` usage without typeof check
- Direct `sessionStorage` usage without typeof check
- Direct `navigator` usage without typeof check

## License

MIT
