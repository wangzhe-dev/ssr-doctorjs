import type { Rule } from 'eslint';
import type { Node, Program } from 'estree';

/**
 * Determine if a file is in an SSR context based on its path
 */
export function isSSRContext(filename: string): boolean {
  // Normalize path separators
  const normalizedPath = filename.replace(/\\/g, '/');

  // Check for Next.js App Router (app directory)
  if (normalizedPath.includes('/app/')) {
    return true;
  }

  // Check for Next.js Pages Router SSR functions
  if (normalizedPath.includes('/pages/')) {
    return true;
  }

  // Check for middleware
  if (normalizedPath.endsWith('middleware.ts') || normalizedPath.endsWith('middleware.js')) {
    return true;
  }

  // Check for API routes (app router)
  if (normalizedPath.includes('/route.ts') || normalizedPath.includes('/route.js')) {
    return true;
  }

  return false;
}

/**
 * Check if a file has 'use client' directive
 */
export function hasUseClientDirective(context: Rule.RuleContext): boolean {
  const sourceCode = context.getSourceCode();
  const comments = sourceCode.getAllComments();
  const ast = sourceCode.ast as Program;

  // Check for 'use client' in directives
  if (ast.body && ast.body.length > 0) {
    const firstNode = ast.body[0];
    if (
      firstNode.type === 'ExpressionStatement' &&
      firstNode.expression.type === 'Literal' &&
      firstNode.expression.value === 'use client'
    ) {
      return true;
    }
  }

  // Also check comments at the top of the file
  for (const comment of comments) {
    if (comment.value.includes('use client')) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a node is inside a typeof guard (e.g., typeof window !== 'undefined')
 */
export function isInsideTypeofGuard(node: Node, globalName: string): boolean {
  let current = node as any;

  while (current) {
    // Check for if statement with typeof guard
    if (current.type === 'IfStatement') {
      const test = current.test;

      // Handle: typeof window !== 'undefined'
      if (
        test.type === 'BinaryExpression' &&
        (test.operator === '!==' || test.operator === '!=') &&
        test.left.type === 'UnaryExpression' &&
        test.left.operator === 'typeof' &&
        test.left.argument.type === 'Identifier' &&
        test.left.argument.name === globalName
      ) {
        return true;
      }

      // Handle: typeof window === 'undefined' (negated logic)
      if (
        test.type === 'BinaryExpression' &&
        (test.operator === '===' || test.operator === '==') &&
        test.left.type === 'UnaryExpression' &&
        test.left.operator === 'typeof' &&
        test.left.argument.type === 'Identifier' &&
        test.left.argument.name === globalName &&
        test.right.type === 'Literal' &&
        test.right.value === 'undefined'
      ) {
        // Only return true if we're NOT in the consequent (i.e., we're in else)
        return false;
      }
    }

    // Check for logical expressions: typeof window !== 'undefined' && ...
    if (current.type === 'LogicalExpression' && current.operator === '&&') {
      const left = current.left;
      if (
        left.type === 'BinaryExpression' &&
        (left.operator === '!==' || left.operator === '!=') &&
        left.left.type === 'UnaryExpression' &&
        left.left.operator === 'typeof' &&
        left.left.argument.type === 'Identifier' &&
        left.left.argument.name === globalName
      ) {
        return true;
      }
    }

    current = current.parent;
  }

  return false;
}

/**
 * Check if node is inside useEffect or similar hook
 */
export function isInsideUseEffect(node: Node): boolean {
  let current = node as any;

  while (current) {
    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'Identifier' &&
      (current.callee.name === 'useEffect' ||
        current.callee.name === 'useLayoutEffect' ||
        current.callee.name === 'useInsertionEffect')
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
