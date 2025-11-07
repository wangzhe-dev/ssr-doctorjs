'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to safely get client-side values after mount
 * Prevents hydration mismatches by using initial value during SSR
 * 
 * @param getter - Function to get the actual value (called only on client)
 * @param initial - Initial value to use during SSR and before mount
 * 
 * @example
 * ```tsx
 * const width = useMountedValue(() => window.innerWidth, 0);
 * ```
 */
export function useMountedValue<T>(getter: () => T, initial: T): T {
  const [val, setVal] = useState<T>(initial);

  useEffect(() => {
    setVal(getter());
  }, []);

  return val;
}
