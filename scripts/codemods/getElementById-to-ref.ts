#!/usr/bin/env ts-node
/**
 * Codemod: Flag document.getElementById for manual conversion to refs
 * 
 * Adds TODO markers for complex DOM operations that should use refs
 * 
 * Example:
 *   const el = document.getElementById('myId');
 * To:
 *   // TODO(SSR-Doctor): const elRef = useRef<HTMLElement | null>(null);
 *   const el = /* TODO(SSR-Doctor): replace with ref */ null;
 */

import { Project, Node, SyntaxKind } from 'ts-morph';
import { globSync } from 'glob';

const files = globSync([
  'examples/next-app/**/*.{tsx,jsx}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/.next/**'
]);

const project = new Project({ skipAddingFilesFromTsConfig: true });
files.forEach(f => project.addSourceFileAtPathIfExists(f));

let changes = 0;

for (const sf of project.getSourceFiles()) {
  sf.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return;
    const expr = node.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return;
    if (expr.getText() !== 'document.getElementById') return;

    const func = node.getFirstAncestor((n) =>
      Node.isFunctionDeclaration(n) || Node.isFunctionExpression(n) || Node.isArrowFunction(n)
    );
    if (!func) return;

    // Ensure react imports
    if (!sf.getImportDeclarations().some(d => d.getModuleSpecifierValue() === 'react')) {
      sf.insertStatements(0, `import { useEffect, useRef } from 'react';`);
    } else {
      const imp = sf.getImportDeclarations().find(d => d.getModuleSpecifierValue() === 'react')!;
      const set = new Set(imp.getNamedImports().map(n => n.getName()));
      if (!set.has('useEffect')) imp.addNamedImport('useEffect');
      if (!set.has('useRef')) imp.addNamedImport('useRef');
    }

    // Replace call with a TODO marker (safe, non-breaking)
    node.replaceWithText(`/* TODO(SSR-Doctor): replace with ref */ null`);

    // Add hint at function start
    const body = (func as any).getBody?.();
    if (body && Node.isBlock(body)) {
      const already = body.getStatements().some(st =>
        st.getText().includes('TODO(SSR-Doctor): const elRef')
      );
      if (!already) {
        body.insertStatements(0,
          `// TODO(SSR-Doctor): const elRef = useRef<HTMLElement | null>(null); // attach ref to JSX and use in useEffect`
        );
      }
    }

    changes++;
  });
}

if (changes) project.saveSync();
console.log(`✅ [getElementById-to-ref] Inserted ${changes} TODO marker(s)`);
