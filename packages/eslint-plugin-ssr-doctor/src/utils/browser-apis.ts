/**
 * List of browser-only global APIs that should not be used in SSR contexts
 */
export const BROWSER_GLOBALS = [
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
  'requestIdleCallback',
  'cancelIdleCallback',
  'IntersectionObserver',
  'MutationObserver',
  'ResizeObserver',
  'PerformanceObserver',
] as const;

export type BrowserGlobal = (typeof BROWSER_GLOBALS)[number];

export function isBrowserGlobal(name: string): boolean {
  return BROWSER_GLOBALS.includes(name as BrowserGlobal);
}
