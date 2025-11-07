#!/usr/bin/env ts-node
/**
 * Codemod: Wrap browser API access with typeof window guards
 * 
 * Transforms:
 *   const width = window.innerWidth;
 * To:
 *   let width = undefined as any;
 *   if (typeof window !== 'undefined') { width = window.innerWidth; }
 */

import { Project, Node, SyntaxKind, VariableDeclarationKind } from 'ts-morph';
import { globSync } from 'glob';

const BROWSER_IDS = new Set([
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage'
]);

const files = globSync([
  'examples/next-app/**/*.{ts,tsx,js,jsx}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/.next/**'
]);

const project = new Project({ skipAddingFilesFromTsConfig: true });
files.forEach(f => project.addSourceFileAtPathIfExists(f));

let changes = 0;

for (const sf of project.getSourceFiles()) {
  sf.forEachDescendant((node) => {
    if (!Node.isVariableDeclaration(node)) return;
    const init = node.getInitializer();
    if (!init) return;

    // Only handle simple "identifier.member..." starts
    const txt = init.getText();
    const hit = Array.from(BROWSER_IDS).some(k =>
      txt.startsWith(`${k}.`) || txt.startsWith(`${k}[`)
    );
    if (!hit) return;

    // Only transform inside a function body (avoid top-level module const)
    const func =
      node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
      node.getFirstAncestorByKind(SyntaxKind.FunctionExpression) ||
      node.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
    if (!func) return;

    const name = node.getName();
    const initializerText = init.getText();

    const varStmt = node.getFirstAncestorByKind(SyntaxKind.VariableStatement);
    if (!varStmt) return;

    // const -> let
    varStmt.setDeclarationKind(VariableDeclarationKind.Let);

    // Set initializer to SSR-safe placeholder
    node.setInitializer('undefined as any');

    // Insert guarded assignment right after the variable statement
    const parentBlock = varStmt.getParentIfKind(SyntaxKind.Block);
    if (parentBlock) {
      const index = varStmt.getChildIndex();
      parentBlock.insertStatements(
        index + 1,
        `if (typeof window !== 'undefined') { ${name} = ${initializerText}; }`
      );
      changes++;
    }
  });
}

if (changes) project.saveSync();
console.log(`✅ [wrap-browser-api-guards] Guarded ${changes} variable(s)`);
