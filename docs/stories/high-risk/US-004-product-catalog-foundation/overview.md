# US-004 Product Catalog Foundation

## Summary

Seed the MVP product catalog in PostgreSQL, expose active product list/detail
API endpoints, and render the catalog in the React shell.

## Product Contract

- Products are demo purchasable items or plan products.
- Backend product data is the source of truth.
- Only active products are returned for normal user purchase flows.
- Product prices displayed in the frontend are preview information until
  checkout.

## Affected Product Docs

- `SPEC.md` section 5 Product Catalog.
- `SPEC.md` section 14.2 Products.
- `docs/product/api-contract.md`.
- `docs/product/domain-contract.md`.
- `docs/product/validation-contract.md`.

## In Scope

- TypeORM product entity and repository.
- Migration for `products` table and deterministic seed rows.
- `GET /products`.
- `GET /products/:slug`.
- React catalog display backed by the API.
- Unit/integration tests for service/controller behavior.

## Out Of Scope

- Cart mutations.
- Checkout, orders, payments, points, and subscriptions.
- LLM product search ranking.
- Admin product management.
