# US-006 Checkout And Currency Foundation

## Current Behavior

Authenticated users can persist a server-side cart with backend-owned product
prices. The application does not yet create immutable purchase requests or
convert USD catalog prices into VND checkout amounts.

## Target Behavior

Add the backend foundation for checkout pricing and immutable order snapshots:

- Re-read active cart items and authoritative product prices from PostgreSQL.
- Reject empty carts and inactive products.
- Convert USD cents to integer VND using static configuration.
- Round each calculated checkout amount up to the nearest 1,000 VND.
- Persist an order and immutable order-item snapshots in one transaction.
- Close the active cart only after order persistence succeeds.

## Affected Users

- Authenticated users preparing to purchase catalog products.
- Future payment, points, subscription, and dev-inspection implementers.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/domain-contract.md`
- `docs/product/validation-contract.md`
- `docs/product/overview.md`

## Non-Goals

- Public `POST /checkout` response before the payment-attempt contract is ready.
- Reward point reservation or redemption.
- payOS adapter, payment link, QR code, webhook, or return URL handling.
- Subscription activation or reward-point earning.
- Browser checkout UI.

