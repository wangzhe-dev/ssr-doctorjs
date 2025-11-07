/**
 * SSR-safe runtime detection utilities
 */

export const isBrowser = (): boolean => typeof window !== 'undefined';
export const isServer = (): boolean => !isBrowser();

/**
 * Get user agent safely (works in both SSR and client)
 */
export function safeUA(defaultUA = 'unknown'): string {
  if (isBrowser()) return navigator.userAgent;
  return defaultUA;
}

/**
 * Get window property safely
 */
export function safeWindow<T>(getter: () => T, fallback: T): T {
  if (isBrowser()) {
    try {
      return getter();
    } catch {
      return fallback;
    }
  }
  return fallback;
}
