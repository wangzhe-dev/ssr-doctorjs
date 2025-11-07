import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { isBrowserGlobal } from '../utils/browser-apis.js';
import { isInsideUseEffect, isInsideTypeofGuard } from '../utils/ssr-context.js';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#${name}`
);

export default createRule({
  name: 'hydration-risk-useeffect',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent hydration mismatches by ensuring browser API calls in React components are placed in useEffect',
      recommended: 'recommended',
    },
    messages: {
      hydrationRisk:
        'Browser API "{{api}}" used during render may cause hydration mismatch. Move to useEffect or add typeof guard.',
      moveToUseEffect: 'Move "{{api}}" access to useEffect hook',
      addTypeofGuard: 'Add typeof guard for "{{api}}"',
    },
    schema: [],
    fixable: 'code',
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    // Track if we're in a React component
    let isInComponent = false;
    let componentName = '';

    function isReactComponent(node: TSESTree.Node): boolean {
      // Check for function components
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        // Check if it returns JSX
        let hasJSXReturn = false;

        // Simple heuristic: check if function name starts with capital letter
        if (node.type === 'FunctionDeclaration' && node.id) {
          const name = node.id.name;
          if (name && name[0] === name[0].toUpperCase()) {
            return true;
          }
        }

        // Check parent for component assignment
        if (node.parent) {
          if (
            node.parent.type === 'VariableDeclarator' &&
            node.parent.id.type === 'Identifier'
          ) {
            const name = node.parent.id.name;
            if (name && name[0] === name[0].toUpperCase()) {
              return true;
            }
          }
        }
      }

      return false;
    }

    function checkBrowserAPIInRender(node: TSESTree.Identifier) {
      const name = node.name;

      // Check if it's a browser global
      if (!isBrowserGlobal(name)) {
        return;
      }

      // Skip if already in useEffect
      if (isInsideUseEffect(node as any)) {
        return;
      }

      // Skip if inside typeof guard
      if (isInsideTypeofGuard(node as any, name)) {
        return;
      }

      // Skip if part of typeof expression itself
      if (node.parent && node.parent.type === 'UnaryExpression' && node.parent.operator === 'typeof') {
        return;
      }

      // Report the issue
      context.report({
        node,
        messageId: 'hydrationRisk',
        data: { api: name },
        suggest: [
          {
            messageId: 'moveToUseEffect',
            data: { api: name },
            fix: null, // Requires manual refactoring
          },
          {
            messageId: 'addTypeofGuard',
            data: { api: name },
            fix(fixer) {
              // Try to wrap in typeof guard
              const sourceCode = context.getSourceCode();

              // Find the statement containing this identifier
              let statement = node.parent;
              while (statement && statement.type !== 'ExpressionStatement' && statement.type !== 'VariableDeclaration') {
                statement = statement.parent;
              }

              if (statement) {
                const statementText = sourceCode.getText(statement as any);
                return fixer.replaceText(
                  statement as any,
                  `if (typeof ${name} !== 'undefined') {\n  ${statementText}\n}`
                );
              }

              return null;
            },
          },
        ],
      });
    }

    return {
      // Track component entry/exit
      'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression'(
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression
      ) {
        if (isReactComponent(node)) {
          isInComponent = true;
          if (node.type === 'FunctionDeclaration' && node.id) {
            componentName = node.id.name;
          } else if (node.parent && node.parent.type === 'VariableDeclarator' && node.parent.id.type === 'Identifier') {
            componentName = node.parent.id.name;
          }
        }
      },

      'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression:exit'(
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression
      ) {
        if (isReactComponent(node)) {
          isInComponent = false;
          componentName = '';
        }
      },

      Identifier(node) {
        // Only check if we're in a component but not in useEffect
        if (!isInComponent) {
          return;
        }

        // Skip property names in member expressions
        if (
          node.parent &&
          node.parent.type === 'MemberExpression' &&
          node.parent.property === node &&
          !node.parent.computed
        ) {
          return;
        }

        // Skip declarations
        if (
          node.parent &&
          (node.parent.type === 'VariableDeclarator' ||
            node.parent.type === 'FunctionDeclaration')
        ) {
          return;
        }

        checkBrowserAPIInRender(node);
      },

      MemberExpression(node) {
        if (!isInComponent) {
          return;
        }

        // Check object of member expression
        if (node.object.type === 'Identifier') {
          const name = node.object.name;

          if (isBrowserGlobal(name)) {
            // Skip if in useEffect
            if (isInsideUseEffect(node as any)) {
              return;
            }

            // Skip if inside typeof guard
            if (isInsideTypeofGuard(node as any, name)) {
              return;
            }

            context.report({
              node: node.object,
              messageId: 'hydrationRisk',
              data: { api: name },
              suggest: [
                {
                  messageId: 'moveToUseEffect',
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
