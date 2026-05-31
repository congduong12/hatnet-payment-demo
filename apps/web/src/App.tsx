import { Show, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/react';
import { useState } from 'react';

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
