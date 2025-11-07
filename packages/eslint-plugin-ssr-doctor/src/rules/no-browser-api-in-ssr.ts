import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { isBrowserGlobal } from '../utils/browser-apis.js';
import { isSSRContext, hasUseClientDirective, isInsideTypeofGuard } from '../utils/ssr-context.js';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#${name}`
);

export default createRule({
  name: 'no-browser-api-in-ssr',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow usage of browser-only APIs in Server-Side Rendering (SSR) contexts without proper guards',
      recommended: 'recommended',
    },
    messages: {
      noBrowserAPI:
        'Browser API "{{api}}" cannot be used in SSR context. Wrap it in a typeof guard or move to useEffect.',
      noBrowserAPISuggestion:
        'Consider wrapping in: if (typeof {{api}} !== "undefined") { ... }',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedAPIs: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of browser APIs to allow without guards',
          },
        },
        additionalProperties: false,
      },
    ],
    hasSuggestions: true,
  },
  defaultOptions: [{ allowedAPIs: [] }],
  create(context, [options]) {
    const filename = context.getFilename();

    // Only check files in SSR contexts
    if (!isSSRContext(filename)) {
      return {};
    }

    // Skip if file has 'use client' directive
    if (hasUseClientDirective(context)) {
      return {};
    }

    const allowedAPIs = new Set(options.allowedAPIs || []);

    function checkIdentifier(node: TSESTree.Identifier) {
      const name = node.name;

      // Skip if it's an allowed API
      if (allowedAPIs.has(name)) {
        return;
      }

      // Check if it's a browser global
      if (!isBrowserGlobal(name)) {
        return;
      }

      // Skip if inside typeof guard
      if (isInsideTypeofGuard(node as any, name)) {
        return;
      }

      // Report the error
      context.report({
        node,
        messageId: 'noBrowserAPI',
        data: { api: name },
        suggest: [
          {
            messageId: 'noBrowserAPISuggestion',
            data: { api: name },
            fix: null, // We'll provide manual suggestion, not auto-fix for safety
          },
        ],
      });
    }

    return {
      Identifier(node) {
        // Skip type references
        const parent = node.parent;
        if (!parent) return;

        // Skip if it's a property name (not a reference)
        if (
          parent.type === 'MemberExpression' &&
          parent.property === node &&
          !parent.computed
        ) {
          return;
        }

        // Skip if it's part of typeof expression
        if (parent.type === 'UnaryExpression' && parent.operator === 'typeof') {
          return;
        }

        // Skip variable/function declarations
        if (
          parent.type === 'VariableDeclarator' &&
          parent.id === node
        ) {
          return;
        }

        if (
          parent.type === 'FunctionDeclaration' &&
          parent.id === node
        ) {
          return;
        }

        // Skip import/export
        if (
          parent.type === 'ImportSpecifier' ||
          parent.type === 'ImportDefaultSpecifier' ||
          parent.type === 'ExportSpecifier'
        ) {
          return;
        }

        checkIdentifier(node);
      },

      MemberExpression(node) {
        // Check for window.something, document.something, etc.
        if (node.object.type === 'Identifier') {
          const name = node.object.name;

          if (allowedAPIs.has(name)) {
            return;
          }

          if (isBrowserGlobal(name)) {
            // Skip if inside typeof guard
            if (isInsideTypeofGuard(node as any, name)) {
              return;
            }

            context.report({
              node: node.object,
              messageId: 'noBrowserAPI',
              data: { api: name },
              suggest: [
                {
                  messageId: 'noBrowserAPISuggestion',
                  data: { api: name },
                  fix: null,
                },
              ],
            });
          }
        }
      },
    };
  },
});
