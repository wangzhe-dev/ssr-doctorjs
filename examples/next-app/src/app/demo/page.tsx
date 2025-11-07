/**
 * Demo page to showcase SSR Doctor detection
 * This page intentionally contains violations for testing
 */

import { WidthDetector } from '@/components/WidthDetector';
import { ChartComponent, MapComponent, EditorComponent } from '@/components/LazyChart';

export default function DemoPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>SSR Doctor Demo Page</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This page contains intentional SSR violations to demonstrate detection capabilities.
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2>❌ Violation 1: Direct Browser API Usage</h2>
        <p>The WidthDetector component uses window.innerWidth without guards:</p>
        <div style={{
          padding: '1rem',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5'
        }}>
          <WidthDetector />
        </div>
        <pre style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f4f4f4',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {`// ❌ VIOLATION: Direct window usage
const width = window.innerWidth;
const isMobile = width < 768;`}
        </pre>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>❌ Violation 2: Missing { '{' }ssr: false{ '}' } in Dynamic Imports</h2>
        <p>These components are loaded with next/dynamic but missing ssr: false:</p>
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          marginTop: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5'
          }}>
            <ChartComponent />
          </div>
          <div style={{
            padding: '1rem',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5'
          }}>
            <MapComponent />
          </div>
        </div>
        <pre style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f4f4f4',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {`// ❌ VIOLATION: Missing { ssr: false }
const ChartComponent = dynamic(() => import('./ChartWidget'));
const MapComponent = dynamic(() => import('./MapWidget'));`}
        </pre>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>✅ Correct: Proper Dynamic Import with { '{' }ssr: false{ '}' }</h2>
        <p>This component correctly uses ssr: false:</p>
        <div style={{
          padding: '1rem',
          border: '2px solid #51cf66',
          borderRadius: '8px',
          backgroundColor: '#f4fdf7'
        }}>
          <EditorComponent />
        </div>
        <pre style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f4f4f4',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {`// ✅ CORRECT: Has { ssr: false }
const EditorComponent = dynamic(() => import('./EditorWidget'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});`}
        </pre>
      </section>

      <section style={{
        padding: '1.5rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        border: '1px solid #2196f3'
      }}>
        <h3>🔍 How to Test</h3>
        <ol style={{ marginLeft: '1.5rem' }}>
          <li>Run: <code style={{
            padding: '0.2rem 0.5rem',
            backgroundColor: '#fff',
            borderRadius: '4px'
          }}>npx ssr-doctor scan --path ./src</code></li>
          <li>Check for violations in:
            <ul>
              <li><code>src/components/WidthDetector.tsx</code></li>
              <li><code>src/components/LazyChart.tsx</code></li>
            </ul>
          </li>
          <li>Verify the violations are detected by ESLint and CLI</li>
        </ol>
      </section>
    </main>
  );
}
