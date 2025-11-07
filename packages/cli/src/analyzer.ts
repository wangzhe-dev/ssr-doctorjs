import { readFileSync } from 'fs';

export interface SSRIssue {
  file: string;
  line: number;
  column: number;
  type: 'window' | 'document' | 'localStorage' | 'sessionStorage' | 'navigator';
  message: string;
  code: string;
}

const SSR_PATTERNS = [
  { type: 'window', pattern: /\bwindow\b/g, message: 'Direct window usage detected' },
  { type: 'document', pattern: /\bdocument\b/g, message: 'Direct document usage detected' },
  { type: 'localStorage', pattern: /\blocalStorage\b/g, message: 'Direct localStorage usage detected' },
  { type: 'sessionStorage', pattern: /\bsessionStorage\b/g, message: 'Direct sessionStorage usage detected' },
  { type: 'navigator', pattern: /\bnavigator\b/g, message: 'Direct navigator usage detected' },
] as const;

export function detectSSRIssues(filePath: string): SSRIssue[] {
  const issues: SSRIssue[] = [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip if line contains typeof check
      if (line.includes('typeof window') || line.includes('typeof document')) {
        continue;
      }

      for (const { type, pattern, message } of SSR_PATTERNS) {
        const matches = line.matchAll(pattern);

        for (const match of matches) {
          if (match.index !== undefined) {
            issues.push({
              file: filePath,
              line: lineIndex + 1,
              column: match.index + 1,
              type: type as any,
              message,
              code: line.trim(),
            });
          }
        }
      }
    }
  } catch (error) {
    // Ignore files that can't be read
  }

  return issues;
}
