#!/usr/bin/env ts-node
/**
 * Codemod: Ensure next/dynamic calls have { ssr: false }
 * 
 * Transforms:
 *   dynamic(() => import('./Component'))
 * To:
 *   dynamic(() => import('./Component'), { ssr: false })
 */

import { Project, Node } from 'ts-morph';
import { globSync } from 'glob';

const files = globSync([
  'examples/next-app/**/*.{ts,tsx,js,jsx}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/.next/**'
]);

const project = new Project({ skipAddingFilesFromTsConfig: true });
files.forEach(f => project.addSourceFileAtPathIfExists(f));

let changed = 0;

for (const sf of project.getSourceFiles()) {
  const hasDynamic = sf.getImportDeclarations().some(
    d => d.getModuleSpecifierValue() === 'next/dynamic'
  );
  if (!hasDynamic) continue;

  sf.forEachDescendant((node) => {
    if (Node.isCallExpression(node)) {
      const expr = node.getExpression();
      if (Node.isIdentifier(expr) && expr.getText() === 'dynamic') {
        const args = node.getArguments();
        if (args.length === 1) {
          // dynamic(() => import('...')) -> dynamic(() => import('...'), { ssr: false })
          node.addArgument('{ ssr: false }');
          changed++;
        } else if (args.length === 2) {
          // Check if second arg already has ssr property
          const secondArg = args[1];
          const text = secondArg.getText();
          if (!text.includes('ssr')) {
            // Add ssr: false to existing options object
            console.log(`⚠️  Skipping ${sf.getFilePath()} - already has options, please add 'ssr: false' manually`);
          }
        }
      }
    }
  });
}

if (changed) project.saveSync();
console.log(`✅ [ensure-dynamic-ssr-false] Updated ${changed} dynamic() call(s)`);
