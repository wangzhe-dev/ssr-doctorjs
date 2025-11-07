import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-localstorage-usage.js';

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-localstorage-usage', rule, {
  valid: [
    {
      code: `if (typeof window !== 'undefined') { localStorage.setItem('key', 'value'); }`,
    },
  ],
  invalid: [
    {
      code: `localStorage.setItem('key', 'value');`,
      errors: [{ messageId: 'localStorageUsage' }],
    },
    {
      code: `const storage = localStorage;`,
      errors: [{ messageId: 'localStorageUsage' }],
    },
  ],
});
