import { Show, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';

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

type AppProps = {
  isClerkConfigured?: boolean;
};

type SyncState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  productType: 'ONE_TIME' | 'PLAN';
  displayPrice: string;
  category: string;
  tags: string[];
};

type CatalogState =
  | { status: 'loading'; products: ProductSummary[]; message: string }
  | { status: 'success'; products: ProductSummary[]; message: string }
  | { status: 'error'; products: ProductSummary[]; message: string };

export function App({ isClerkConfigured = true }: AppProps) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <strong>Hatnet Demo</strong>
        <AuthControls isClerkConfigured={isClerkConfigured} />
      </header>

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
          <span>Auth</span>
          <strong>Clerk boundary</strong>
          <p>Frontend gets a session token; backend verifies it before syncing a user.</p>
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

        <ProductCatalog />
      </main>
    );
  }

function AuthControls({ isClerkConfigured }: { isClerkConfigured: boolean }) {
  if (!isClerkConfigured) {
    return (
      <div className="auth-warning" role="status">
        Add VITE_CLERK_PUBLISHABLE_KEY to enable Clerk login.
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className="secondary">
            Sign up
          </button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <SyncUserButton />
        <UserButton />
      </Show>
    </div>
  );
}

function ProductCatalog() {
  const [catalogState, setCatalogState] = useState<CatalogState>({
    status: 'loading',
    products: [],
    message: 'Loading products...',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await fetch(`${apiBaseUrl}/products`);

        if (!response.ok) {
          throw new Error(`Product API returned ${response.status}`);
        }

        const body = (await response.json()) as { products?: ProductSummary[] };
        const products = body.products ?? [];

        if (!isMounted) {
          return;
        }

        setCatalogState({
          status: 'success',
          products,
          message: products.length > 0 ? 'Products loaded from the backend.' : 'No active products yet.',
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setCatalogState({
          status: 'error',
          products: [],
          message: 'Product API is not reachable yet.',
        });
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="catalog-panel" aria-labelledby="catalog-heading">
      <div className="section-heading">
        <p className="label">Product catalog</p>
        <h2 id="catalog-heading">Backend-seeded products</h2>
        <p>{catalogState.message}</p>
      </div>

      {catalogState.status === 'success' && catalogState.products.length > 0 ? (
        <div className="product-grid">
          {catalogState.products.map((product) => (
            <article key={product.id} className="product-card">
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.shortDescription}</p>
              <strong>{product.displayPrice}</strong>
              <small>{product.productType === 'PLAN' ? 'Plan product' : 'One-time product'}</small>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SyncUserButton() {
  const { getToken } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    message: 'Sync backend user',
  });

  async function syncUser() {
    setSyncState({ status: 'loading', message: 'Syncing...' });
    const token = await getToken();

    if (!token) {
      setSyncState({ status: 'error', message: 'No Clerk session token.' });
      return;
    }

    const response = await fetch(`${apiBaseUrl}/auth/sync-user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setSyncState({ status: 'error', message: `Sync failed (${response.status}).` });
      return;
    }

    setSyncState({ status: 'success', message: 'Backend user synced.' });
  }

  return (
    <button type="button" data-status={syncState.status} onClick={() => void syncUser()}>
      {syncState.message}
    </button>
  );
}
