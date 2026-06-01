# Design

## Data Model

`carts` stores the active cart per internal user. `cart_items` stores one row
per product in a cart and has a unique `(cart_id, product_id)` constraint.

## API

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

All endpoints require the Clerk auth guard and derive the internal user from
verified auth.

## Quantity Rules

Quantity is clamped by validation, not silently adjusted:

- minimum: 1
- maximum: 10
- adding an existing item increments quantity and rejects values above 10
- add-item increments are performed as a PostgreSQL upsert so concurrent
  requests cannot lose increments or leak unique-constraint errors

## Boundary Validation

Cart mutation IDs are parsed before database queries:

- `productId` must be a valid UUID before product lookup.
- `itemId` route params must be valid UUIDs before cart item lookup.

## Totals

Cart subtotal is calculated from `ProductEntity.priceAmount * quantity`.
Checkout currency conversion, point discount, and payment totals are deferred.
