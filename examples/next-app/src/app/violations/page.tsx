/**
 * Page that demonstrates SSR violations
 * This file is in the app directory without 'use client',
 * so it's an SSR context
 */

import {
  HydrationRiskExample,
  BrowserAPIViolation,
  MultipleBrowserAPIs,
  ConditionalBrowserAPI,
  SafeBrowserAPI,
} from '@/components/ViolationExamples';

// ❌ Violation: no-browser-api-in-ssr
// Direct browser API usage in server component
export default function ViolationsPage() {
  // These will trigger no-browser-api-in-ssr errors
  const userAgent = navigator.userAgent;
  const pageWidth = window.innerWidth;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>SSR Violations Examples</h1>
      <p>User Agent: {userAgent}</p>
      <p>Page Width: {pageWidth}</p>

      <section>
        <h2>Hydration Risk Examples</h2>
        <HydrationRiskExample />
        <ConditionalBrowserAPI />
      </section>

      <section>
        <h2>Browser API Violations</h2>
        <BrowserAPIViolation />
        <MultipleBrowserAPIs />
      </section>

      <section>
        <h2>Safe Usage</h2>
        <SafeBrowserAPI />
      </section>
    </main>
  );
}
