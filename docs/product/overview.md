# VN Payment Learning Lab Overview

## Product

VN Payment Learning Lab is a demo web application for learning realistic
Vietnam ecommerce and payment flows end to end.

The MVP should let an authenticated user browse demo products, manage a
server-side cart, check out in VND, receive a payment link or QR flow from
payOS, and have the backend process verified payment callbacks into order,
payment, reward point, and Pro subscription state changes.

## MVP Scope

MVP must prove these flows:

- Login/logout with Clerk and internal user sync.
- Product catalog and product detail display.
- Server-side cart with add, update, remove, clear, and summary behavior.
- Checkout that recalculates prices on the backend.
- USD to VND conversion using a static FX rate and round-up-to-1,000-VND rule.
- Reward point reservation at checkout and confirm/release after payment result.
- payOS payment creation and verified webhook/callback processing.
- Simulated Pro subscription for 30 days with manual renew.
- Grant 10 reward points after a verified paid Pro order.
- Gemini-assisted product search with deterministic DB-first fallback.
- Admin/dev inspection pages for order, payment, payment event, reward ledger, subscription, and LLM search debugging.

## Explicit Non-Goals For MVP

- Multiple production payment providers running at once.
- Real recurring subscription auto-charge.
- Saved payment methods.
- Full refund automation.
- Production MoMo, ZaloPay, VNPay, or Stripe integration.
- Passkeys/WebAuthn.
- Full admin portal, analytics dashboard, or advanced fraud/security policy.
- Advanced redirect allowlisting, RBAC, rate limiting, payload encryption, or audit policy beyond the minimum needed for safe demo behavior.

## Product Surfaces

- React browser app for users.
- NestJS HTTP API for authenticated product, cart, checkout, billing, points, search, and admin/dev data.
- payOS webhook endpoint.
- Admin/dev browser surface for inspection.

## Source Of Truth Rules

- Backend is the source of truth for product price, cart totals, checkout totals, payment status, reward balances, and subscription state.
- Frontend return URLs are UX hints only; they never mark an order paid.
- Verified webhook/callback processing is the payment source of truth.
- Reward ledger is append-only.
- LLM output can rank and explain candidate products, but final product IDs, prices, discounts, and order/payment changes must be validated against backend data.

## Phase Plan

1. Project foundation.
2. Auth and user sync.
3. Product and cart.
4. Checkout and currency.
5. Points and ledger.
6. payOS payment.
7. Subscription.
8. LLM search.
9. Admin/dev inspection.
10. Test plan and hardening.
