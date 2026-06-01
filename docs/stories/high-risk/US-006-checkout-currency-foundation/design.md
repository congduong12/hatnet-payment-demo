# Design

## Domain Model

Add order records as immutable checkout intent:

- `OrderEntity`: owning user, status, subtotal, discount, payable amount,
  checkout currency, FX snapshot, and timestamps.
- `OrderItemEntity`: order id, product id, product name snapshot, product
  metadata snapshot, original USD cents, FX snapshot, rounded VND amount, and
  quantity.

Money calculations use integers only:

- Product USD amount is stored in cents.
- Static `USD_TO_VND_RATE` is stored as integer VND per USD.
- Raw VND calculation uses integer numerator math:
  `usdCents * rate / 100`.
- Final checkout VND amount rounds up to the nearest 1,000 VND.

## Application Flow

Add a checkout preparation service that:

1. Synchronizes the authenticated internal user.
2. Loads the active cart and product-backed cart items.
3. Rejects an empty cart or inactive product.
4. Recalculates prices from current database product records.
5. Persists the order, order-item snapshots, and cart status transition inside
   one TypeORM transaction.
6. Returns the persisted order summary for service-level proof and future
   payment orchestration.

## Interface Contract

Do not expose `POST /checkout` in this story.

The drafted API response includes `paymentId`, `paymentUrl`, `qrCode`, and
`expiresAt`. Those values do not exist until the payOS payment-attempt story.
Publishing a partial endpoint now would either weaken the contract or create
temporary response fields that later need replacement.

## Data Model

Add:

- `orders`
- `order_items`

Required indexes and constraints:

- FK from order to internal user.
- FK from order item to order.
- FK from order item to product for traceability.
- Integer and non-negative checks for persisted amounts.
- Quantity check matching cart quantity limits.

## UI / Platform Impact

No browser changes. Add `USD_TO_VND_RATE` to validated backend environment
configuration with a deterministic local default.

## Observability

Persistence provides durable order snapshots. Payment event logs remain
deferred until the payOS story.

## Alternatives Considered

1. Publish a partial `POST /checkout` without payment fields. Rejected because
   it creates a temporary public contract that conflicts with the accepted API
   draft.
2. Combine checkout, points, and payOS into one story. Rejected because the
   transaction, money, external-provider, and webhook proof surface becomes too
   large for one reviewable slice.
3. Persist a floating-point FX result. Rejected because the product contract
   requires integer-safe money calculations.

