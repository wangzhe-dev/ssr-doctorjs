import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-window-usage.js';

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-window-usage', rule, {
  valid: [
    {
      code: `if (typeof window !== 'undefined') { window.location.href = '/'; }`,
    },
    {
      code: `const isClient = typeof window !== 'undefined';`,
    },
  ],
  invalid: [
    {
      code: `window.location.href = '/';`,
      errors: [{ messageId: 'windowUsage' }],
    },
    {
      code: `const w = window;`,
      errors: [{ messageId: 'windowUsage' }],
    },
    {
      code: `console.log(window.innerWidth);`,
      errors: [{ messageId: 'windowUsage' }],
    },
  ],
});
