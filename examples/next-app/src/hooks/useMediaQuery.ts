'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe media query hook
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @param ssrDefault - Default value to use during SSR
 */
export function useMediaQuery(query: string, ssrDefault = false): boolean {
  const [matches, setMatches] = useState(ssrDefault);

  useEffect(() => {
    if (!('matchMedia' in window)) return;

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    // Set initial value
    onChange();

    // Listen for changes
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}
