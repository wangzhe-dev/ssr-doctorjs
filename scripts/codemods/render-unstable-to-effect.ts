#!/usr/bin/env ts-node
/**
 * Codemod: Move non-deterministic values from render to useEffect
 * 
 * Transforms JSX expressions using Date.now() or Math.random() to state + useEffect
 * 
 * Example:
 *   <div>{Date.now()}</div>
 * To:
 *   const [nowTs, setNowTs] = useState<any>(null);
 *   useEffect(() => { setNowTs(Date.now()); }, []);
 *   <div>{nowTs ?? '...'}</div>
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
  let mutated = false;

  sf.forEachDescendant((node) => {
    if (!Node.isJsxExpression(node)) return;
    const exp = node.getExpression();
    if (!exp) return;

    const txt = exp.getText();
    const isNow = txt.includes('Date.now()') || txt.includes('new Date(');
    const isRand = txt.includes('Math.random()');
    if (!isNow && !isRand) return;

    // Only handle when inside a function with a block body
    const func = node.getFirstAncestor((n) =>
      Node.isFunctionDeclaration(n) || Node.isFunctionExpression(n) || Node.isArrowFunction(n)
    );
    if (!func) return;

    // If no block body (implicit return), skip for safety
    const body = (func as any).getBody?.();
    if (!body || !Node.isBlock(body)) return;

    // Ensure hooks imports
    if (!sf.getImportDeclarations().some(d => d.getModuleSpecifierValue() === 'react')) {
      sf.insertStatements(0, `import { useEffect, useState } from 'react';`);
    } else {
      const imp = sf.getImportDeclarations().find(d => d.getModuleSpecifierValue() === 'react')!;
      const set = new Set(imp.getNamedImports().map(n => n.getName()));
      if (!set.has('useEffect')) imp.addNamedImport('useEffect');
      if (!set.has('useState')) imp.addNamedImport('useState');
    }

    const stateName = isNow ? 'nowTs' : 'rndVal';
    const getter = isNow ? 'Date.now()' : 'Math.random()';
    const setter = `set${stateName.charAt(0).toUpperCase()}${stateName.slice(1)}`;

    // Insert state + effect at top of function body if not already present
    const already = body.getStatements().some(st =>
      st.getText().includes(`const [${stateName}, ${setter}]`)
    );
    if (!already) {
      body.insertStatements(0, `
const [${stateName}, ${setter}] = useState<any>(null);
useEffect(() => { ${setter}(${getter}); }, []);
      `.trim());
    }

    // Replace the JSX expression with state fallback
    node.replaceWithText(`{${stateName} ?? '...'}`);
    mutated = true;
    changes++;
  });

  if (mutated) sf.saveSync();
}

console.log(`✅ [render-unstable-to-effect] Replaced ${changes} JSX expression(s)`);
