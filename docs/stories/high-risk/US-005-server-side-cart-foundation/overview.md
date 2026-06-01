# US-005 Server-Side Cart Foundation

## Summary

Add authenticated server-side cart behavior for the product catalog.

## Product Contract

- Each authenticated user has one active cart.
- Cart item points to a product.
- Quantity must be between 1 and 10.
- Adding the same product increments quantity.
- Backend recalculates totals from database product prices.

## In Scope

- `carts` and `cart_items` TypeORM entities and migration.
- Authenticated cart API endpoints.
- Backend subtotal calculation from active products.
- React add-to-cart controls for signed-in users.
- Unit and integration proof.

## Out Of Scope

- Checkout and order creation.
- Payments, points, subscriptions, and reward ledger.
- Browser E2E with real Clerk keys.
