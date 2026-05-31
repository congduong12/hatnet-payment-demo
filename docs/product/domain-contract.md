# Domain Contract

## User

Users are internal records mapped from an external Clerk identity.

Rules:

- Backend must not trust a `userId` supplied by the client.
- Internal user lookup is based on a verified auth token.
- New authenticated users get an internal user record and default Free plan state.
- Internal users are persisted in PostgreSQL and uniquely mapped by external auth provider plus external auth user id.

## Product

Products are demo purchasable items or plan products.

Rules:

- MVP product catalog is seeded in PostgreSQL and addressed by unique slug.
- Inactive products cannot be added to cart.
- Backend prices are authoritative.
- Order items snapshot product name, metadata, price, currency, FX, and checkout amount.
- Old orders do not change when product prices change later.

## Cart

MVP uses a server-side active cart per authenticated user.

Rules:

- Quantity minimum is 1.
- Quantity maximum is 10 per item.
- Adding the same product increments quantity.
- Empty cart cannot be checked out.
- Checkout clears or closes the active cart after order creation.

## Order And Payment

Orders represent immutable checkout intent after validation. Payments represent
provider attempts for an order.

Order statuses:

- `DRAFT`
- `PENDING_PAYMENT`
- `PAID`
- `PAYMENT_FAILED`
- `CANCELLED`
- `EXPIRED`
- `REFUNDED`

Payment statuses:

- `INITIATED`
- `PENDING`
- `PAID`
- `FAILED`
- `CANCELLED`
- `EXPIRED`
- `REFUNDED`
- `AMOUNT_MISMATCH`
- `VERIFY_FAILED`

Rules:

- Payment amount from provider must match order payable amount.
- Currency must be VND.
- Duplicate webhooks must be idempotent.
- Return URL is not a payment source of truth.
- Wrong signature, amount mismatch, or currency mismatch must not mark an order paid.

## Money And Currency

Rules:

- USD amounts are stored as cents.
- VND amounts are stored as integers.
- Floating point arithmetic must not be used for money.
- MVP FX rate comes from static config.
- USD to VND checkout amount is rounded up to the nearest 1,000 VND.
- Orders snapshot FX rate, source, applied time, rounding mode, discount, points, and final payable amount.

## Reward Points

Rules:

- 1 point equals 1,000 VND discount.
- Buying or renewing Pro after verified payment grants 10 points.
- Max redeemable points per order is the minimum of available points, 30 percent of subtotal converted to points, and non-negative payable limit.
- Points are reserved when creating the order.
- Payment success confirms reserved points.
- Payment failed, cancelled, or expired releases reserved points.
- Points expire 12 months after earn date.
- Balance cannot go negative in MVP.
- Every balance change must have a ledger transaction.

MVP point transaction types:

- `EARN_PRO_PURCHASE`
- `REDEEM_RESERVED`
- `REDEEM_CONFIRMED`
- `REDEEM_RELEASED`
- `EXPIRE`
- `ADMIN_ADJUSTMENT`

## Subscription

MVP uses simulated monthly Pro subscription.

Rules:

- New users default to Free.
- First Pro purchase sets `PRO_ACTIVE`, starts now, and expires in 30 days.
- Active renew extends from current `expiresAt`.
- Expired renew starts from current time.
- Lazy expiry checks may update or return `PRO_EXPIRED` when protected APIs observe an expired Pro subscription.
- No recurring auto-charge or saved payment method exists in MVP.

## LLM Search

Rules:

- Backend runs deterministic DB search first.
- Gemini receives sanitized candidate product metadata only.
- Gemini must return structured output validated by schema.
- Backend rechecks product IDs and prices against DB.
- Gemini failure, timeout, or invalid JSON falls back to deterministic search.
- Gemini cannot create products, change prices, create discounts, create orders, mark payments paid, grant points, or change subscriptions.
