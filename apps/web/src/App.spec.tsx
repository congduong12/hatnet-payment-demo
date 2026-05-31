import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.js';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the learning lab shell', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: [] }),
      }),
    );

    render(<App isClerkConfigured={false} />);

    expect(screen.getByRole('heading', { name: /learn the full vietnam checkout flow/i })).toBeInTheDocument();
    expect(screen.getByText('NestJS API')).toBeInTheDocument();
    expect(screen.getByText('React + Vite')).toBeInTheDocument();
    expect(screen.getByText(/add vite_clerk_publishable_key/i)).toBeInTheDocument();
  });

  it('renders products returned by the backend catalog API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              id: '22222222-2222-2222-2222-222222222222',
              name: 'Pro Plan',
              slug: 'pro-plan',
              shortDescription: 'Monthly Pro access with points reward.',
              productType: 'PLAN',
              displayPrice: '$10',
              category: 'Plan',
              tags: ['plan', 'pro'],
            },
          ],
        }),
      }),
    );

    render(<App isClerkConfigured={false} />);

    expect(await screen.findByRole('heading', { name: 'Pro Plan' })).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('Plan product')).toBeInTheDocument();
  });
});
