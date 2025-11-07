'use client';

import { DynamicImportExamples } from '@/components/DynamicImportViolations';

export default function DynamicExamplesPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dynamic Import Examples</h1>
      <p>This page demonstrates dynamic import patterns</p>
      <DynamicImportExamples />
    </main>
  );
}
