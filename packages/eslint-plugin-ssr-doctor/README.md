# @ssr-doctor/eslint-plugin

ESLint plugin to detect SSR compatibility issues in React applications.

## Installation

```bash
npm install --save-dev @ssr-doctor/eslint-plugin
# or
pnpm add -D @ssr-doctor/eslint-plugin
```

## Usage

Add to your `.eslintrc`:

```json
{
  "plugins": ["@ssr-doctor"],
  "rules": {
    "@ssr-doctor/no-window-usage": "error",
    "@ssr-doctor/no-document-usage": "error",
    "@ssr-doctor/no-localstorage-usage": "error"
  }
}
```

Or use the recommended config:

```json
{
  "extends": ["plugin:@ssr-doctor/recommended"]
}
```

## Rules

### `no-window-usage`

Disallows direct usage of `window` object without SSR check.

**Bad:**
```javascript
window.location.href = '/';
const width = window.innerWidth;
```

**Good:**
```javascript
if (typeof window !== 'undefined') {
  window.location.href = '/';
}
```

### `no-document-usage`

Disallows direct usage of `document` object without SSR check.

**Bad:**
```javascript
document.title = 'My App';
const el = document.getElementById('root');
```

**Good:**
```javascript
if (typeof document !== 'undefined') {
  document.title = 'My App';
}
```

### `no-localstorage-usage`

Disallows direct usage of `localStorage` without SSR check.

**Bad:**
```javascript
localStorage.setItem('key', 'value');
```

**Good:**
```javascript
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

## License

MIT
