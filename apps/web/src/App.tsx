const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const phases = [
  'Project foundation',
  'Auth and user sync',
  'Product and cart',
  'Checkout and currency',
  'Points and ledger',
  'payOS payment',
  'Subscription',
  'LLM search',
  'Admin/dev inspection',
];

export function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="label">VN Payment Learning Lab</p>
        <h1>Learn the full Vietnam checkout flow without pretending money is simple.</h1>
        <p className="summary">
          A NestJS and React demo for auth, server-side carts, VND checkout,
          payOS webhooks, reward points, simulated Pro subscriptions, and
          Gemini-assisted product search.
        </p>
      </section>

      <section className="status-grid" aria-label="Project status">
        <article>
          <span>Backend</span>
          <strong>NestJS API</strong>
          <p>Smoke endpoint: {apiBaseUrl}/health</p>
        </article>
        <article>
          <span>Frontend</span>
          <strong>React + Vite</strong>
          <p>Phase 0 app shell ready for product slices.</p>
        </article>
        <article>
          <span>Source of truth</span>
          <strong>Backend first</strong>
          <p>Prices, payment status, points, and subscription state stay server-owned.</p>
        </article>
      </section>

      <section className="phase-panel">
        <h2>MVP build path</h2>
        <ol>
          {phases.map((phase) => (
            <li key={phase}>{phase}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
