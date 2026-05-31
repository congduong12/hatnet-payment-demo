# Validation Contract

## Global Proof Rules

- Passing build/type/lint checks is not enough for payment, money, auth, points, or subscription stories.
- Public behavior must have story acceptance criteria and matrix evidence before it is marked implemented.
- Provider callbacks and LLM responses need integration or contract tests with deterministic fixtures.
- Any story that weakens proof requirements must record a decision or blocker.

## Unit Proof

Required unit coverage areas:

- USD cents to VND conversion.
- Round up to nearest 1,000 VND.
- Max redeemable point calculation.
- Point reserve, confirm, release, earn, expire rules.
- Subscription first purchase, active renew, expired renew, lazy expiry.
- LLM schema validation and fallback classification.
- Auth boundary helpers that map verified identity to internal user commands.

## Integration Proof

Required integration coverage areas:

- Authenticated endpoint rejects missing/invalid token.
- Product inactive cannot be added to cart.
- Checkout creates order, order items, payment attempt, and point reservation atomically.
- payOS webhook success marks payment/order paid idempotently.
- Wrong signature, amount mismatch, or currency mismatch does not mark paid.
- Duplicate webhook does not duplicate points or entitlement changes.
- Failed/cancelled/expired payment releases reserved points.
- Repository queries enforce ownership boundaries.

## E2E Proof

Required E2E coverage areas:

- User can log in, view products, add to cart, and start checkout.
- Success page handles pending payment confirmation instead of trusting return URL.
- Billing page shows Free/Pro, expiry, point balance, and transaction history.
- Search page shows deterministic fallback when LLM fails.
- Admin/dev page can inspect order, payment event, reward ledger, subscription, and LLM logs in local/staging mode.

## Platform Proof

Required platform proof areas:

- Environment variable validation fails fast without leaking secrets.
- Local backend and frontend dev servers can start.
- Database migrations or schema sync commands are documented and repeatable.
- Deployment target and env sync are verified before claiming deploy readiness.

## MVP Acceptance Evidence

MVP cannot be called complete until the matrix has implemented rows for:

- Auth/user sync.
- Product/cart.
- Checkout/currency.
- Points reservation.
- payOS webhook.
- Subscription activation/renewal.
- LLM search fallback.
- Admin/dev inspection.
