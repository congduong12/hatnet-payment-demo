import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';

describe('App', () => {
  it('renders the learning lab shell', () => {
    render(<App isClerkConfigured={false} />);

    expect(screen.getByRole('heading', { name: /learn the full vietnam checkout flow/i })).toBeInTheDocument();
    expect(screen.getByText('NestJS API')).toBeInTheDocument();
    expect(screen.getByText('React + Vite')).toBeInTheDocument();
    expect(screen.getByText(/add vite_clerk_publishable_key/i)).toBeInTheDocument();
  });
});
