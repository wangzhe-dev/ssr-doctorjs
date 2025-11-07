import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/hydration-risk-useeffect.js';

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('hydration-risk-useeffect', rule, {
  valid: [
    // In useEffect
    {
      code: `
        import { useEffect } from 'react';
        function Component() {
          useEffect(() => {
            const width = window.innerWidth;
          }, []);
          return <div>Hello</div>;
        }
      `,
    },

    // With typeof guard
    {
      code: `
        function Component() {
          const width = typeof window !== 'undefined' ? window.innerWidth : 0;
          return <div>{width}</div>;
        }
      `,
    },

    // In useLayoutEffect
    {
      code: `
        import { useLayoutEffect } from 'react';
        function Component() {
          useLayoutEffect(() => {
            const title = document.title;
          }, []);
          return <div>Hello</div>;
        }
      `,
    },

    // Not a component
    {
      code: `
        function helper() {
          return window.innerWidth;
        }
      `,
    },
  ],

  invalid: [
    // Browser API in component render
    {
      code: `
        function Component() {
          const width = window.innerWidth;
          return <div>{width}</div>;
        }
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'window' },
        },
      ],
    },

    // document in component
    {
      code: `
        function MyComponent() {
          const title = document.title;
          return <div>{title}</div>;
        }
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'document' },
        },
      ],
    },

    // localStorage in component
    {
      code: `
        function UserProfile() {
          const theme = localStorage.getItem('theme');
          return <div className={theme}>Profile</div>;
        }
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'localStorage' },
        },
      ],
    },

    // navigator in component
    {
      code: `
        function BrowserInfo() {
          const ua = navigator.userAgent;
          return <div>{ua}</div>;
        }
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'navigator' },
        },
      ],
    },

    // Multiple browser APIs
    {
      code: `
        function BadComponent() {
          const width = window.innerWidth;
          const title = document.title;
          return <div>{width} - {title}</div>;
        }
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'window' },
        },
        {
          messageId: 'hydrationRisk',
          data: { api: 'document' },
        },
      ],
    },

    // Arrow function component
    {
      code: `
        const Component = () => {
          const width = window.innerWidth;
          return <div>{width}</div>;
        };
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'window' },
        },
      ],
    },

    // In conditional render (still problematic)
    {
      code: `
        function Component() {
          const isWide = window.innerWidth > 768;
          return <div>{isWide ? 'Wide' : 'Narrow'}</div>;
        }
      `,
      errors: [
        {
          messageId: 'hydrationRisk',
          data: { api: 'window' },
        },
      ],
    },
  ],
});
