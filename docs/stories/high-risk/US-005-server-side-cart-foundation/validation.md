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

- `pnpm check`: passed API and web TypeScript checks after cart hardening.
- `pnpm test`: passed API 6 files / 14 tests and web 1 file / 2 tests after adding malformed UUID boundary tests.
- `pnpm build`: passed API TypeScript build and web Vite build.
- `docker compose up -d postgres`: reused running `hatnet-demo-postgres`.
- `pnpm db:migrate`: no pending migrations; existing `CreateCartTables1717372800000` remains current.
- `pnpm --filter @hatnet/api start`: booted and mapped `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, and `DELETE /cart`.
- `curl -i http://localhost:3000/cart`: returned `401` without a bearer token.
- `docker compose exec -T postgres psql -U hatnet -d hatnet_demo -c "\\dt" -c "\\d carts" -c "\\d cart_items"`: confirmed `carts` and `cart_items` tables with user/product FKs, unique active cart per user, unique item per product, and quantity check constraint.
- `docker compose exec -T postgres psql ...`: rollback smoke verified active-cart `ON CONFLICT`, cart-item atomic increment from 1 to 3, and over-limit increment affecting 0 rows with final quantity remaining 3.
