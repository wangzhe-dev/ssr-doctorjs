import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/dynamic-ssr-flag.js';

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

ruleTester.run('dynamic-ssr-flag', rule, {
  valid: [
    // Has { ssr: false }
    {
      code: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), { ssr: false });
      `,
    },

    // Has { ssr: false } with other options
    {
      code: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), {
          loading: () => <div>Loading...</div>,
          ssr: false
        });
      `,
    },

    // Not from next/dynamic
    {
      code: `
        import dynamic from 'some-other-library';
        const Component = dynamic(() => import('./Component'));
      `,
    },
  ],

  invalid: [
    // Missing { ssr: false }
    {
      code: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'));
      `,
      errors: [
        {
          messageId: 'missingSsrFalse',
        },
      ],
      output: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), { ssr: false });
      `,
    },

    // Has options but no ssr: false
    {
      code: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), {
          loading: () => <div>Loading...</div>
        });
      `,
      errors: [
        {
          messageId: 'missingSsrFalse',
        },
      ],
      output: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), {
          loading: () => <div>Loading...</div>, ssr: false
        });
      `,
    },

    // Empty options object
    {
      code: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), {});
      `,
      errors: [
        {
          messageId: 'missingSsrFalse',
        },
      ],
      output: `
        import dynamic from 'next/dynamic';
        const Component = dynamic(() => import('./Component'), { ssr: false });
      `,
    },

    // Multiple dynamic imports
    {
      code: `
        import dynamic from 'next/dynamic';
        const Comp1 = dynamic(() => import('./Comp1'));
        const Comp2 = dynamic(() => import('./Comp2'));
      `,
      errors: [
        {
          messageId: 'missingSsrFalse',
        },
        {
          messageId: 'missingSsrFalse',
        },
      ],
      output: `
        import dynamic from 'next/dynamic';
        const Comp1 = dynamic(() => import('./Comp1'), { ssr: false });
        const Comp2 = dynamic(() => import('./Comp2'), { ssr: false });
      `,
    },
  ],
});
