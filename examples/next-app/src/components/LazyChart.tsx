'use client';

import dynamic from 'next/dynamic';

/**
 * Example of dynamic import violation:
 * Missing { ssr: false } option
 *
 * This should trigger:
 * - @ssr-doctor/dynamic-ssr-flag
 */

// ❌ VIOLATION: Missing { ssr: false }
export const ChartComponent = dynamic(() => import('./ChartWidget'));

// ❌ VIOLATION: Another missing { ssr: false }
export const MapComponent = dynamic(() => import('./MapWidget'));

// ✅ CORRECT: Has { ssr: false }
export const EditorComponent = dynamic(() => import('./EditorWidget'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});
