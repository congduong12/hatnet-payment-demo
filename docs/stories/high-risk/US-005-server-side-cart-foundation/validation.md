# Validation

## Commands

```text
docker compose up -d postgres
pnpm db:migrate
pnpm check
pnpm test
pnpm build
pnpm dev:local
```

## Acceptance Evidence

- `pnpm check`: passed API and web TypeScript checks.
- `pnpm test`: passed API 6 files / 12 tests and web 1 file / 2 tests.
- `pnpm build`: passed API TypeScript build and web Vite build.
- `docker compose up -d postgres`: reused running `hatnet-demo-postgres`.
- `pnpm db:migrate`: ran `CreateCartTables1717372800000`.
- `pnpm --filter @hatnet/api start`: booted and mapped `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, and `DELETE /cart`.
- `curl -i http://localhost:3000/cart`: returned `401` without a bearer token.
- `docker compose exec -T postgres psql -U hatnet -d hatnet_demo -c "\\dt" -c "\\d carts" -c "\\d cart_items"`: confirmed `carts` and `cart_items` tables with user/product FKs, unique active cart per user, unique item per product, and quantity check constraint.
