import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-document-usage.js';

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-document-usage', rule, {
  valid: [
    {
      code: `if (typeof document !== 'undefined') { document.title = 'Test'; }`,
    },
  ],
  invalid: [
    {
      code: `document.title = 'Test';`,
      errors: [{ messageId: 'documentUsage' }],
    },
    {
      code: `const el = document.getElementById('root');`,
      errors: [{ messageId: 'documentUsage' }],
    },
  ],
});
