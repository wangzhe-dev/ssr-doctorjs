# ESLint Configuration Examples

Complete `.eslintrc.json` examples for various project setups.

---

## Next.js App Router (Recommended)

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@ssr-doctor/recommended"
  ],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

---

## Next.js Pages Router

```json
{
  "extends": [
    "next",
    "plugin:@ssr-doctor/recommended"
  ],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  },
  "overrides": [
    {
      "files": ["pages/api/**/*.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

---

## Monorepo with Multiple Apps

```json
{
  "root": true,
  "extends": ["plugin:@ssr-doctor/recommended"],
  "overrides": [
    {
      "files": ["apps/web/**/*.{ts,tsx}"],
      "extends": ["next/core-web-vitals"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "error",
        "@ssr-doctor/dynamic-ssr-flag": "warn",
        "@ssr-doctor/hydration-risk-useeffect": "error"
      }
    },
    {
      "files": ["apps/admin/**/*.{ts,tsx}"],
      "extends": ["next/core-web-vitals"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "error",
        "@ssr-doctor/dynamic-ssr-flag": "warn",
        "@ssr-doctor/hydration-risk-useeffect": "error"
      }
    },
    {
      "files": ["packages/ui/**/*.{ts,tsx}"],
      "rules": {
        "@ssr-doctor/hydration-risk-useeffect": "error",
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    },
    {
      "files": ["packages/utils/**/*.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off",
        "@ssr-doctor/dynamic-ssr-flag": "off",
        "@ssr-doctor/hydration-risk-useeffect": "off"
      }
    }
  ]
}
```

---

## React SSR (Custom Setup)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@ssr-doctor/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

---

## Incremental Adoption (Warnings Only)

```json
{
  "extends": ["plugin:@ssr-doctor/recommended"],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "warn",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "warn"
  }
}
```

---

## Strict Mode (All Rules)

```json
{
  "extends": ["plugin:@ssr-doctor/all"],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "error",
    "@ssr-doctor/hydration-risk-useeffect": "error",
    "@ssr-doctor/no-window-usage": "error",
    "@ssr-doctor/no-document-usage": "error",
    "@ssr-doctor/no-localstorage-usage": "error"
  }
}
```

---

## With Custom Allowed APIs

```json
{
  "extends": ["plugin:@ssr-doctor/recommended"],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": ["error", {
      "allowedAPIs": ["navigator", "location"]
    }],
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

---

## With File-specific Overrides

```json
{
  "extends": ["plugin:@ssr-doctor/recommended"],
  "overrides": [
    {
      "files": ["src/utils/browser-only.ts", "src/analytics/**/*.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    },
    {
      "files": ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off",
        "@ssr-doctor/hydration-risk-useeffect": "off"
      }
    },
    {
      "files": ["src/components/**/*.stories.tsx"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

---

## Gatsby

```json
{
  "extends": [
    "react-app",
    "plugin:@ssr-doctor/recommended"
  ],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  },
  "overrides": [
    {
      "files": ["gatsby-browser.js", "gatsby-node.js"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ]
}
```

---

## Remix

```json
{
  "extends": [
    "@remix-run/eslint-config",
    "plugin:@ssr-doctor/recommended"
  ],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

---

## Astro (with React)

```json
{
  "extends": [
    "plugin:astro/recommended",
    "plugin:@ssr-doctor/recommended"
  ],
  "overrides": [
    {
      "files": ["*.astro"],
      "parser": "astro-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "extraFileExtensions": [".astro"]
      },
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "error",
        "@ssr-doctor/hydration-risk-useeffect": "error"
      }
    }
  ]
}
```

---

## TypeScript Strict

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@ssr-doctor/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error",
    "@typescript-eslint/strict-boolean-expressions": "error"
  }
}
```

---

## JavaScript (No TypeScript)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@ssr-doctor/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error"
  }
}
```

---

## With Prettier

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@ssr-doctor/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error",
    "prettier/prettier": "error"
  }
}
```

---

## With Import Order

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@ssr-doctor/recommended"
  ],
  "plugins": ["import"],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc"
        }
      }
    ]
  }
}
```

---

## Flat Config (ESLint 9+)

```js
// eslint.config.js
import ssrDoctor from '@ssr-doctor/eslint-plugin';
import next from 'eslint-config-next';

export default [
  ...next,
  {
    plugins: {
      '@ssr-doctor': ssrDoctor,
    },
    rules: {
      '@ssr-doctor/no-browser-api-in-ssr': 'error',
      '@ssr-doctor/dynamic-ssr-flag': 'warn',
      '@ssr-doctor/hydration-risk-useeffect': 'error',
    },
  },
];
```

---

## Complete Enterprise Setup

```json
{
  "root": true,
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@ssr-doctor/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "@ssr-doctor", "import", "jsx-a11y"],
  "rules": {
    "@ssr-doctor/no-browser-api-in-ssr": "error",
    "@ssr-doctor/dynamic-ssr-flag": "warn",
    "@ssr-doctor/hydration-risk-useeffect": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/order": ["error", { "newlines-between": "always" }],
    "prettier/prettier": "error"
  },
  "overrides": [
    {
      "files": ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      "extends": ["plugin:testing-library/react"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off",
        "@ssr-doctor/hydration-risk-useeffect": "off"
      }
    },
    {
      "files": ["src/utils/browser/**/*.ts"],
      "rules": {
        "@ssr-doctor/no-browser-api-in-ssr": "off"
      }
    }
  ],
  "settings": {
    "import/resolver": {
      "typescript": {
        "project": "./tsconfig.json"
      }
    },
    "react": {
      "version": "detect"
    }
  }
}
```

---

## Tips

### VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    { "mode": "auto" }
  ]
}
```

### Performance

For large projects:

```json
{
  "cache": true,
  "cacheLocation": ".eslintcache"
}
```

Run with:
```bash
eslint --cache --cache-location .eslintcache .
```

### Debugging

Enable debug mode:
```bash
DEBUG=eslint:* npx eslint src/
```

---

Need a custom configuration? [Open an issue](https://github.com/wangzhe-dev/ssr-doctorjs/issues) with your use case!
