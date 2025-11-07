#!/usr/bin/env ts-node
/**
 * SSR Doctor - Auto-fix Runner
 * 
 * Runs all codemod scripts in sequence to automatically fix common SSR issues
 */

import { execSync } from 'node:child_process';

const cmds = [
  'ts-node scripts/codemods/ensure-dynamic-ssr-false.ts',
  'ts-node scripts/codemods/wrap-browser-api-guards.ts',
  'ts-node scripts/codemods/render-unstable-to-effect.ts',
  'ts-node scripts/codemods/getElementById-to-ref.ts'
];

console.log('🔧 SSR Doctor Auto-Fix\n');
console.log('Running codemods to fix common SSR compatibility issues...\n');

let totalSuccess = 0;
let totalFailed = 0;

for (const cmd of cmds) {
  const name = cmd.split('/').pop()?.replace('.ts', '') || cmd;
  console.log(`\n━━━ Running: ${name} ━━━`);

  try {
    execSync(cmd, { stdio: 'inherit' });
    totalSuccess++;
  } catch (e) {
    console.error(`❌ Failed: ${name}`);
    totalFailed++;
    // Continue to next script
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n✅ Summary: ${totalSuccess} succeeded, ${totalFailed} failed\n`);

if (totalFailed > 0) {
  console.log('⚠️  Some codemods failed. Please check the errors above.');
  process.exit(1);
}

console.log('🎉 All codemods completed successfully!');
console.log('\n💡 Next steps:');
console.log('  1. Review the changes: git diff');
console.log('  2. Run build: pnpm build');
console.log('  3. Run tests: pnpm test');
console.log('  4. Commit changes: git add . && git commit -m "feat: apply SSR auto-fixes"');
