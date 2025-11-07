import { describe, it, expect } from 'vitest';
import { detectSSRIssues } from '@ssr-doctor/core';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('analyzer', () => {
  it('should detect window usage', () => {
    const testFile = join(process.cwd(), 'test-temp.ts');
    writeFileSync(testFile, 'const width = window.innerWidth;');

    const issues = detectSSRIssues(testFile);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].type).toBe('window');

    unlinkSync(testFile);
  });

  it('should not flag typeof window check', () => {
    const testFile = join(process.cwd(), 'test-temp.ts');
    writeFileSync(testFile, 'if (typeof window !== "undefined") { const w = window; }');

    const issues = detectSSRIssues(testFile);

    expect(issues.length).toBe(0);

    unlinkSync(testFile);
  });
});
