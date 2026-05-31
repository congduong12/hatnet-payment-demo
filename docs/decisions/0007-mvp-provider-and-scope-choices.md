# 0007 MVP Provider And Scope Choices

Date: 2026-06-01

## Status

Accepted

## Context

The MVP is a learning app for Vietnam payment flows. It needs enough realism to
exercise auth, checkout, webhooks, points, subscription state, and LLM fallback
without expanding into production-grade billing, multi-provider operations, or
advanced security hardening before the core flow exists.

## Decision

Accept the provider and scope choices from `SPEC.md` as the MVP contract:

- Auth: Clerk with Google OAuth.
- Payment: payOS only.
- Subscription: simulated monthly Pro subscription, manual renew, no recurring auto-charge.
- Currency: USD product pricing can convert to VND checkout using static FX config.
- Points: append-only ledger with reservation at order creation.
- LLM search: Gemini-assisted ranking over deterministic DB candidates with required fallback.
- Admin/dev: inspection pages for local/staging debugging, not a full admin portal.

Do not implement a mock payment provider in MVP unless payOS setup becomes a documented blocker.

## Alternatives Considered

1. DIY JWT/refresh auth.
2. Firebase Auth.
3. Stripe as primary provider.
4. Real recurring subscription billing.
5. Mock payment provider first.

## Consequences

Positive:

- Keeps the learning target focused on Vietnam VND payment link/QR style flows.
- Avoids self-implemented auth security pitfalls at the start.
- Still exercises realistic subscription and reward ledger lifecycle.
- Preserves deterministic fallback for LLM behavior.

Tradeoffs:

- Requires external provider setup for Clerk, payOS, and Gemini.
- payOS sandbox/callback friction may block full local proof.
- Some Vercel payment/auth plugin guidance is Next.js or Stripe-focused and must be adapted.
- Advanced admin security and redirect hardening remain explicit phase-later work.

## Follow-Up

- Verify payOS sandbox and webhook signing docs before implementing payment code.
- Verify current Clerk React and NestJS token verification docs before implementing auth code.
- Verify current Gemini SDK/API structured output approach before implementing LLM search.
