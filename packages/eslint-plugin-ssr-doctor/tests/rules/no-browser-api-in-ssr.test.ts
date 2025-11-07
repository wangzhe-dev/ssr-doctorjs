import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-browser-api-in-ssr.js';

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

ruleTester.run('no-browser-api-in-ssr', rule, {
  valid: [
    // Client component with 'use client'
    {
      code: `
        'use client';
        export default function Component() {
          const width = window.innerWidth;
          return <div>{width}</div>;
        }
      `,
      filename: 'app/components/ClientComponent.tsx',
    },

    // Non-SSR file
    {
      code: `
        const width = window.innerWidth;
      `,
      filename: 'src/utils/helper.ts',
    },

    // With typeof guard
    {
      code: `
        export default function Component() {
          if (typeof window !== 'undefined') {
            const width = window.innerWidth;
          }
        }
      `,
      filename: 'app/components/Component.tsx',
    },

    // In useEffect
    {
      code: `
        import { useEffect } from 'react';
        export default function Component() {
          useEffect(() => {
            const width = window.innerWidth;
          }, []);
        }
      `,
      filename: 'app/components/Component.tsx',
    },

    // Allowed APIs via options
    {
      code: `
        export default function Component() {
          const ua = navigator.userAgent;
        }
      `,
      filename: 'app/components/Component.tsx',
      options: [{ allowedAPIs: ['navigator'] }],
    },
  ],

  invalid: [
    // Direct window usage in app directory
    {
      code: `
        export default function Component() {
          const width = window.innerWidth;
          return <div>{width}</div>;
        }
      `,
      filename: 'app/components/Component.tsx',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'window' },
        },
      ],
    },

    // Direct document usage in pages directory
    {
      code: `
        export default function Page() {
          const title = document.title;
          return <div>{title}</div>;
        }
      `,
      filename: 'pages/index.tsx',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'document' },
        },
      ],
    },

    // localStorage usage
    {
      code: `
        export default function Component() {
          const theme = localStorage.getItem('theme');
          return <div>{theme}</div>;
        }
      `,
      filename: 'app/layout.tsx',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'localStorage' },
        },
      ],
    },

    // navigator usage
    {
      code: `
        export default function Component() {
          const ua = navigator.userAgent;
          return <div>{ua}</div>;
        }
      `,
      filename: 'app/page.tsx',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'navigator' },
        },
      ],
    },

    // Multiple browser APIs
    {
      code: `
        export default function Component() {
          const width = window.innerWidth;
          const title = document.title;
          return <div>{width} - {title}</div>;
        }
      `,
      filename: 'app/components/Bad.tsx',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'window' },
        },
        {
          messageId: 'noBrowserAPI',
          data: { api: 'document' },
        },
      ],
    },

    // In middleware.ts
    {
      code: `
        export function middleware() {
          const host = window.location.host;
          return new Response();
        }
      `,
      filename: 'middleware.ts',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'window' },
        },
      ],
    },

    // In route handler
    {
      code: `
        export async function GET() {
          const ua = navigator.userAgent;
          return Response.json({ ua });
        }
      `,
      filename: 'app/api/users/route.ts',
      errors: [
        {
          messageId: 'noBrowserAPI',
          data: { api: 'navigator' },
        },
      ],
    },
  ],
});
