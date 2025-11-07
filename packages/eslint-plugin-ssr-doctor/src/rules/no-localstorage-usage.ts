import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#${name}`
);

export default createRule({
  name: 'no-localstorage-usage',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct usage of localStorage without SSR check',
    },
    messages: {
      localStorageUsage: 'Direct usage of "localStorage" may cause SSR issues. Consider using typeof window !== "undefined" check.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'localStorage'
        ) {
          context.report({
            node: node.object,
            messageId: 'localStorageUsage',
          });
        }
        // Also catch window.localStorage
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'window' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'localStorage'
        ) {
          // Check if window is already checked
          let parent = node.parent;
          let isInTypeofCheck = false;

          while (parent) {
            if (
              parent.type === 'BinaryExpression' &&
              parent.left.type === 'UnaryExpression' &&
              parent.left.operator === 'typeof' &&
              parent.left.argument.type === 'Identifier' &&
              parent.left.argument.name === 'window'
            ) {
              isInTypeofCheck = true;
              break;
            }
            parent = parent.parent;
          }

          if (!isInTypeofCheck) {
            context.report({
              node: node.property,
              messageId: 'localStorageUsage',
            });
          }
        }
      },
      Identifier(node) {
        if (
          node.name === 'localStorage' &&
          node.parent?.type !== 'MemberExpression'
        ) {
          context.report({
            node,
            messageId: 'localStorageUsage',
          });
        }
      },
    };
  },
});
