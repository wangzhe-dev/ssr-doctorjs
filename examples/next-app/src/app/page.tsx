import { BadComponent } from '@/components/BadComponent';
import { GoodComponent } from '@/components/GoodComponent';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>SSR Doctor Demo</h1>

      <section style={{ marginTop: '2rem' }}>
        <h2>❌ Bad Example (will trigger SSR issues)</h2>
        <BadComponent />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>✅ Good Example (SSR-safe)</h2>
        <GoodComponent />
      </section>
    </main>
  );
}
