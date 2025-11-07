import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/eslint-plugin-ssr-doctor#${name}`
);

export default createRule({
  name: 'dynamic-ssr-flag',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce { ssr: false } option when using next/dynamic for components that use browser APIs',
      recommended: 'recommended',
    },
    messages: {
      missingSsrFalse:
        'Component "{{component}}" uses browser APIs but is imported with next/dynamic without { ssr: false }',
      addSsrFalse: 'Add { ssr: false } option to dynamic import',
    },
    schema: [],
    fixable: 'code',
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    const dynamicImports = new Map<
      string,
      {
        node: TSESTree.CallExpression;
        hasSSRFalse: boolean;
        componentPath: string | null;
      }
    >();

    return {
      // Track dynamic() calls from next/dynamic
      CallExpression(node) {
        // Check if this is a dynamic() call
        if (node.callee.type === 'Identifier' && node.callee.name === 'dynamic') {
          // Get the source code
          const sourceCode = context.getSourceCode();
          const scope = sourceCode.getScope?.(node) ?? context.getScope();

          // Check if 'dynamic' is imported from 'next/dynamic'
          let isDynamicFromNext = false;
          for (const variable of scope.variables) {
            if (variable.name === 'dynamic') {
              const def = variable.defs[0];
              if (
                def &&
                def.type === 'ImportBinding' &&
                def.parent.type === 'ImportDeclaration' &&
                def.parent.source.value === 'next/dynamic'
              ) {
                isDynamicFromNext = true;
                break;
              }
            }
          }

          if (!isDynamicFromNext) {
            return;
          }

          // Check if it has { ssr: false } option
          let hasSSRFalse = false;
          let componentPath: string | null = null;

          // First argument is the component import
          const firstArg = node.arguments[0];
          if (firstArg && firstArg.type === 'ArrowFunctionExpression') {
            const body = firstArg.body;
            if (body.type === 'CallExpression' && body.callee.type === 'Import') {
              // dynamic(() => import('./Component'))
              const importArg = body.arguments[0];
              if (importArg && importArg.type === 'Literal') {
                componentPath = String(importArg.value);
              }
            }
          }

          // Second argument is the options object
          const secondArg = node.arguments[1];
          if (secondArg && secondArg.type === 'ObjectExpression') {
            for (const prop of secondArg.properties) {
              if (
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'ssr' &&
                prop.value.type === 'Literal' &&
                prop.value.value === false
              ) {
                hasSSRFalse = true;
                break;
              }
            }
          }

          // Store this dynamic import for potential reporting
          if (componentPath) {
            dynamicImports.set(componentPath, {
              node,
              hasSSRFalse,
              componentPath,
            });
          }

          // If no options object at all, report and suggest fix
          if (!hasSSRFalse && componentPath) {
            context.report({
              node,
              messageId: 'missingSsrFalse',
              data: { component: componentPath },
              fix(fixer) {
                const sourceCode = context.getSourceCode();

                if (node.arguments.length === 1) {
                  // No options object, add one
                  const firstArg = node.arguments[0];
                  const firstArgText = sourceCode.getText(firstArg);
                  return fixer.replaceText(
                    node,
                    `dynamic(${firstArgText}, { ssr: false })`
                  );
                } else if (secondArg && secondArg.type === 'ObjectExpression') {
                  // Has options object but no ssr: false
                  if (secondArg.properties.length === 0) {
                    // Empty object
                    return fixer.replaceText(secondArg, '{ ssr: false }');
                  } else {
                    // Add ssr: false to existing properties
                    const lastProp = secondArg.properties[secondArg.properties.length - 1];
                    return fixer.insertTextAfter(lastProp, ', ssr: false');
                  }
                }

                return null;
              },
              suggest: [
                {
                  messageId: 'addSsrFalse',
                  fix(fixer) {
                    const sourceCode = context.getSourceCode();

                    if (node.arguments.length === 1) {
                      const firstArg = node.arguments[0];
                      const firstArgText = sourceCode.getText(firstArg);
                      return fixer.replaceText(
                        node,
                        `dynamic(${firstArgText}, { ssr: false })`
                      );
                    } else if (secondArg && secondArg.type === 'ObjectExpression') {
                      if (secondArg.properties.length === 0) {
                        return fixer.replaceText(secondArg, '{ ssr: false }');
                      } else {
                        const lastProp = secondArg.properties[secondArg.properties.length - 1];
                        return fixer.insertTextAfter(lastProp, ', ssr: false');
                      }
                    }

                    return null;
                  },
                },
              ],
            });
          }
        }
      },
    };
  },
});
