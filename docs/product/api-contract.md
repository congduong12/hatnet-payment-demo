# API Contract Draft

## Boundary Rules

- All authenticated endpoints derive user identity from a verified auth token.
- Unknown request body, params, query, headers, env vars, provider payloads, and LLM responses must be parsed before entering application/domain code.
- Backend response shapes should be explicit and stable once a story is implemented.
- Public API contract changes require story and matrix updates.

## Auth And User

- `GET /me`
- `POST /auth/sync-user`

Expected behavior:

- Invalid or expired token returns `401`.
- Authenticated but unauthorized access returns `403`.
- First sync creates an internal user record.
- Cross-origin frontend requests send the Clerk session token in the
  `Authorization: Bearer <token>` header.
- Backend derives identity from the verified Clerk token and ignores any
  client-supplied `userId`.

## Products

- `GET /products`
- `GET /products/:slug`
- `GET /products/search`

Expected behavior:

- Only active products are returned for normal user purchase flows.
- Product prices are display information until checkout; backend recalculates during checkout.
- Product responses are sourced from PostgreSQL seed/catalog data and returned as camelCase API fields.

## Cart

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

Expected behavior:

- Cart responses include backend-calculated subtotal, discount, point preview, and total where applicable.
- Product inactive, invalid quantity, or empty checkout attempts are rejected.
- Cart endpoints require verified auth and derive the active cart from the internal synced user.
- `POST /cart/items` accepts `productId` and `quantity`; adding the same product increments quantity up to the MVP limit of 10.

## Checkout

- `POST /checkout`

Request fields:

- `usePoints`
- `pointsToRedeem`
- `paymentProvider`
- `successUrl`
- `cancelUrl`

Response fields:

- `orderId`
- `paymentId`
- `amount`
- `currency`
- `paymentUrl`
- `qrCode`
- `expiresAt`
- `status`
- `reservedPoints`

Expected behavior:

- Backend recalculates all prices and totals.
- Backend reserves points before creating provider payment.
- MVP may accept frontend success/cancel URLs for learning, but these URLs do not mark payment success.

## Orders

- `GET /orders`
- `GET /orders/:id`
- `POST /orders/:id/cancel`
- `POST /orders/:id/retry-payment`

Expected behavior:

- Users can only access their own orders unless using a protected admin/dev surface.
- Retry creates a new payment attempt for the same order when line items remain unchanged.

## Payments

- `GET /payments/:id`
- `POST /payments/webhooks/payos`
- `POST /payments/:id/verify`

Expected behavior:

- payOS webhook verifies signature, provider IDs, amount, currency, and idempotency.
- Dev/admin verify endpoint is local/staging or admin-protected only.

## Billing

- `GET /billing`
- `POST /billing/upgrade-pro`
- `POST /billing/renew-pro`

Expected behavior:

- Billing shows current plan, Pro expiry, reward point balance, point transactions, order/subscription history, and upgrade/renew CTA.

## Points

- `GET /points/balance`
- `GET /points/transactions`

Expected behavior:

- Point transaction history is append-only from the user perspective.
- Available and reserved balances are distinct.

## Search

- `POST /search`

Response fields:

- `mode`
- `products`
- `explanations`
- `parsedIntent`
- `confidence`
- `fallbackReason`

Expected behavior:

- `mode` is one of `DETERMINISTIC`, `LLM_ENHANCED`, or `FALLBACK`.
- Final returned products always come from DB.

## Dev/Admin

- `GET /dev/orders`
- `GET /dev/orders/:id/timeline`
- `GET /dev/payments`
- `GET /dev/payment-events`
- `GET /dev/reward-ledger`
- `GET /dev/llm-search-queries`

Expected behavior:

- Dev/admin surface is not public production functionality.
- Sensitive payloads must be redacted before display.
