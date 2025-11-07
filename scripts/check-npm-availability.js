#!/usr/bin/env node

/**
 * Check if npm package names are available
 * If not, suggest fallback names
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const packages = [
  {
    name: '@ssr-doctor/eslint-plugin',
    fallback: '@ssr-doctorjs/eslint-plugin',
    path: 'packages/eslint-plugin-ssr-doctor/package.json',
  },
  {
    name: '@ssr-doctor/cli',
    fallback: '@ssr-doctorjs/cli',
    path: 'packages/cli/package.json',
  },
];

async function checkPackageAvailability(packageName) {
  try {
    execSync(`npm view ${packageName} version`, { stdio: 'pipe' });
    return false; // Package exists
  } catch (error) {
    return true; // Package available
  }
}

async function updatePackageName(pkgPath, newName) {
  const fullPath = path.join(process.cwd(), pkgPath);
  const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  pkg.name = newName;
  fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✅ Updated ${pkgPath} to use ${newName}`);
}

async function main() {
  console.log('🔍 Checking npm package name availability...\n');

  let needsUpdate = false;

  for (const pkg of packages) {
    const available = await checkPackageAvailability(pkg.name);

    if (available) {
      console.log(`✅ ${pkg.name} is available`);
    } else {
      console.log(`❌ ${pkg.name} is taken`);
      console.log(`   Checking fallback: ${pkg.fallback}`);

      const fallbackAvailable = await checkPackageAvailability(pkg.fallback);

      if (fallbackAvailable) {
        console.log(`   ✅ ${pkg.fallback} is available - updating package.json\n`);
        await updatePackageName(pkg.path, pkg.fallback);
        needsUpdate = true;
      } else {
        console.log(
          `   ❌ ${pkg.fallback} is also taken - manual intervention required\n`
        );
        process.exit(1);
      }
    }
  }

  if (needsUpdate) {
    console.log('\n⚠️  Package names were updated. Please:');
    console.log('1. Review the changes');
    console.log('2. Update documentation to reflect new package names');
    console.log('3. Commit the changes');
  } else {
    console.log('\n✅ All package names are available!');
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
