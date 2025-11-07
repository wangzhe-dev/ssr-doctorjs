/**
 * Examples of dynamic import violations
 */

'use client';

import dynamic from 'next/dynamic';

// ❌ Violation: dynamic-ssr-flag
// Missing { ssr: false } for component that uses browser APIs
const ClientOnlyComponent = dynamic(() => import('./ClientOnlyWidget'));

// ❌ Violation: dynamic-ssr-flag
// Multiple dynamic imports without ssr: false
const Map = dynamic(() => import('./MapComponent'));
const Chart = dynamic(() => import('./ChartComponent'));

// ✅ Good: Has { ssr: false }
const ProperDynamicImport = dynamic(() => import('./BrowserSpecificComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

// ✅ Good: With ssr: false
const AnotherProperImport = dynamic(() => import('./AnotherComponent'), {
  ssr: false,
});

export function DynamicImportExamples() {
  return (
    <div>
      <h2>Dynamic Import Examples</h2>
      <ClientOnlyComponent />
      <Map />
      <Chart />
      <ProperDynamicImport />
      <AnotherProperImport />
    </div>
  );
}
