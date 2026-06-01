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

Add results after implementation verification.

