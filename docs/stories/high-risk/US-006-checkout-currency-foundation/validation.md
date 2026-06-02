# Validation

## Proof Strategy

Prove money rules independently, then prove PostgreSQL persistence and rollback
behavior at the real transaction boundary.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | USD cents to VND integer conversion; round up to 1,000 VND; exact-thousand result; invalid FX config |
| Integration | Empty cart rejected; inactive product rejected; authoritative DB price snapshot; order and item persisted atomically; cart closes only after success; rollback leaves cart active |
| E2E | Deferred until public checkout endpoint and payOS payment attempt exist |
| Platform | Environment parser accepts valid integer FX rate and rejects invalid values |
| Performance | Not required for this story |
| Logs/Audit | Durable order snapshot exists; payment event logs deferred |

## Fixtures

- Authenticated internal user with one active cart.
- Active USD-priced product.
- Inactive product fixture.
- Static `USD_TO_VND_RATE=24850`.

## Commands

```text
docker compose up -d postgres
pnpm db:migrate
pnpm check
pnpm test
pnpm build
```

## Acceptance Evidence

- `pnpm --filter @hatnet/api test` passed checkout money, repository, and
  service tests.
- `pnpm --filter @hatnet/api check` passed backend type checking.
- `pnpm --filter @hatnet/api build` passed backend production build.
- `docker compose up -d postgres` confirmed local PostgreSQL was running.
- `pnpm db:migrate` completed with no pending migrations after
  `CreateOrdersTables1717465600000` was applied.
- PostgreSQL smoke created an authenticated user's active cart with `pro-plan`,
  called `CheckoutRepository.prepareCheckout`, and verified:
  - order payable amount `249000` VND from `999` USD cents at
    `USD_TO_VND_RATE=24850`;
  - persisted order item snapshot has `checkout_currency='VND'` and line amount
    `249000`;
  - source cart moved to `CHECKED_OUT`;
  - smoke rows were cleaned up afterwards.
