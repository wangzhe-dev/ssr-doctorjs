import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#${name}`
);

export default createRule({
  name: 'no-document-usage',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct usage of document object without SSR check',
    },
    messages: {
      documentUsage: 'Direct usage of "document" may cause SSR issues. Consider using typeof document !== "undefined" check.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'document'
        ) {
          // Check if it's already wrapped in a typeof check
          let parent = node.parent;
          let isInTypeofCheck = false;

          while (parent) {
            if (
              parent.type === 'BinaryExpression' &&
              parent.left.type === 'UnaryExpression' &&
              parent.left.operator === 'typeof' &&
              parent.left.argument.type === 'Identifier' &&
              parent.left.argument.name === 'document'
            ) {
              isInTypeofCheck = true;
              break;
            }
            parent = parent.parent;
          }

          if (!isInTypeofCheck) {
            context.report({
              node: node.object,
              messageId: 'documentUsage',
            });
          }
        }
      },
      Identifier(node) {
        if (
          node.name === 'document' &&
          node.parent?.type !== 'MemberExpression' &&
          node.parent?.type !== 'UnaryExpression'
        ) {
          context.report({
            node,
            messageId: 'documentUsage',
          });
        }
      },
    };
  },
});
