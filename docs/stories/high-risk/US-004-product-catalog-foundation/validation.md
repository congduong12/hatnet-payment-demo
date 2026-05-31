# Validation

## Proof Strategy

US-004 is done when the local database has seeded active products, the API can
serve list/detail responses from TypeORM, the React shell renders product data,
and the Harness matrix records the proof.

## Commands

```text
docker compose up -d postgres
pnpm db:migrate
pnpm check
pnpm test
pnpm build
pnpm --filter @hatnet/api start
curl -s http://localhost:3000/products
curl -s http://localhost:3000/products/pro-plan
```

## Acceptance Evidence

- `docker compose up -d postgres`: reused running `hatnet-demo-postgres`.
- `pnpm db:migrate`: ran `CreateProductsTable1717286400000`.
- `pnpm check`: passed API and web TypeScript checks.
- `pnpm test`: passed API 5 files / 10 tests and web 1 file / 2 tests.
- `pnpm build`: passed API TypeScript build and web Vite build.
- `curl -s http://localhost:3000/products`: returned 5 active seeded products.
- `curl -s http://localhost:3000/products/pro-plan`: returned Pro Plan detail from the database.
- `docker compose exec -T postgres psql -U hatnet -d hatnet_demo -c "SELECT slug, product_type, price_amount, price_currency, is_active FROM products ORDER BY slug;"`: confirmed `free-plan`, `pro-plan`, `nestjs-payment-workshop`, `react-checkout-ui-kit`, and `gemini-product-search-pack`.
