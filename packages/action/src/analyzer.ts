import { readFileSync } from 'fs';

export interface SSRIssue {
  file: string;
  line: number;
  column: number;
  type: 'browser-api' | 'hydration-risk' | 'dynamic-ssr';
  severity: 'error' | 'warning';
  api: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Comprehensive list of browser-only APIs (matching ESLint plugin)
const BROWSER_GLOBALS = [
  'window',
  'document',
  'navigator',
  'location',
  'localStorage',
  'sessionStorage',
  'history',
  'HTMLElement',
  'Node',
  'Event',
  'Image',
  'FormData',
  'Blob',
  'File',
  'FileReader',
  'crypto',
  'indexedDB',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'IntersectionObserver',
  'MutationObserver',
  'ResizeObserver',
  'CustomEvent',
  'DOMParser',
  'XMLHttpRequest',
];

const DYNAMIC_IMPORT_PATTERN = /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(/g;

/**
 * Check if a line contains a typeof guard for the given API
 */
function hasTypeofGuard(line: string, api: string): boolean {
  // typeof window !== 'undefined'
  // typeof window !== "undefined"
  // typeof window != 'undefined'
  const patterns = [
    new RegExp(`typeof\\s+${api}\\s*!==?\\s*['"]undefined['"]`, 'i'),
    new RegExp(`typeof\\s+${api}\\s*===?\\s*['"]undefined['"]`, 'i'),
    new RegExp(`${api}\\s*!==?\\s*undefined`, 'i'),
    new RegExp(`${api}\\s*===?\\s*undefined`, 'i'),
  ];

  return patterns.some((pattern) => pattern.test(line));
}

/**
 * Check if a line is inside a 'use client' directive file
 */
function hasUseClient(content: string): boolean {
  const lines = content.split('\n').slice(0, 5); // Check first 5 lines
  return lines.some((line) => line.trim() === "'use client'" || line.trim() === '"use client"');
}

/**
 * Check if a file is in SSR context based on path
 */
function isSSRContext(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Next.js App Router
  if (normalizedPath.includes('/app/') && !normalizedPath.includes('.test.')) {
    return true;
  }

  // Next.js Pages Router
  if (normalizedPath.includes('/pages/') && !normalizedPath.includes('.test.')) {
    return true;
  }

  // Middleware
  if (normalizedPath.endsWith('middleware.ts') || normalizedPath.endsWith('middleware.js')) {
    return true;
  }

  // API routes
  if (normalizedPath.includes('/route.ts') || normalizedPath.includes('/route.js')) {
    return true;
  }

  return false;
}

/**
 * Check if line is inside useEffect
 */
function isInUseEffect(lines: string[], lineIndex: number): boolean {
  // Look backwards for useEffect opening
  let bracketCount = 0;
  let inUseEffect = false;

  for (let i = lineIndex; i >= 0 && i >= lineIndex - 20; i--) {
    const line = lines[i];

    // Count brackets
    bracketCount += (line.match(/\{/g) || []).length;
    bracketCount -= (line.match(/\}/g) || []).length;

    // Check for useEffect
    if (/useEffect\s*\(/.test(line)) {
      inUseEffect = true;
      break;
    }

    // If we've closed all brackets, stop
    if (bracketCount <= 0 && i < lineIndex) {
      break;
    }
  }

  return inUseEffect;
}

/**
 * Detect SSR compatibility issues in a file
 */
export function detectSSRIssues(filePath: string): SSRIssue[] {
  const issues: SSRIssue[] = [];

  // Only check TypeScript/JavaScript files in potential SSR contexts
  if (!isSSRContext(filePath)) {
    return issues;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Skip files with 'use client' directive
    if (hasUseClient(content)) {
      return issues;
    }

    // Check for browser API usage
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const trimmedLine = line.trim();

      // Skip comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
        continue;
      }

      // Skip imports
      if (trimmedLine.startsWith('import ')) {
        continue;
      }

      // Check each browser global
      for (const api of BROWSER_GLOBALS) {
        // Create pattern that matches the API as a standalone word
        const apiPattern = new RegExp(`\\b${api}\\b`, 'g');
        const matches = [...line.matchAll(apiPattern)];

        for (const match of matches) {
          if (match.index === undefined) continue;

          // Skip if it's part of typeof expression
          if (/typeof\s+/.test(line.substring(Math.max(0, match.index - 10), match.index))) {
            continue;
          }

          // Skip if line has typeof guard
          if (hasTypeofGuard(line, api)) {
            continue;
          }

          // Check if inside useEffect
          const inUseEffect = isInUseEffect(lines, lineIndex);

          // Determine severity
          const severity: 'error' | 'warning' = inUseEffect ? 'warning' : 'error';
          const type: 'browser-api' | 'hydration-risk' = inUseEffect ? 'hydration-risk' : 'browser-api';

          issues.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            type,
            severity,
            api,
            message: inUseEffect
              ? `Browser API "${api}" may cause hydration mismatch`
              : `Browser API "${api}" is not available during SSR`,
            code: trimmedLine,
            suggestion: inUseEffect
              ? `Move "${api}" access inside useEffect hook`
              : `Wrap in: if (typeof ${api} !== 'undefined') { ... }`,
          });
        }
      }

      // Check for missing { ssr: false } in dynamic imports
      const dynamicMatches = [...line.matchAll(DYNAMIC_IMPORT_PATTERN)];
      for (const match of dynamicMatches) {
        if (match.index === undefined) continue;

        // Check if same line or next few lines have { ssr: false }
        let hasSsrFalse = false;
        for (let i = lineIndex; i < Math.min(lineIndex + 3, lines.length); i++) {
          if (/ssr\s*:\s*false/.test(lines[i])) {
            hasSsrFalse = true;
            break;
          }
        }

        if (!hasSsrFalse) {
          issues.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            type: 'dynamic-ssr',
            severity: 'warning',
            api: 'dynamic',
            message: 'Dynamic import should include { ssr: false } option',
            code: trimmedLine,
            suggestion: 'Add { ssr: false } to the dynamic import options',
          });
        }
      }
    }
  } catch (error) {
    // Ignore files that can't be read
  }

  return issues;
}

/**
 * Get statistics about detected issues
 */
export function getIssueStats(issues: SSRIssue[]) {
  const stats = {
    total: issues.length,
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    byType: {
      'browser-api': issues.filter((i) => i.type === 'browser-api').length,
      'hydration-risk': issues.filter((i) => i.type === 'hydration-risk').length,
      'dynamic-ssr': issues.filter((i) => i.type === 'dynamic-ssr').length,
    },
    files: new Set(issues.map((i) => i.file)).size,
  };

  return stats;
}
