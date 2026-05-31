# Validation

## Proof Strategy

The story is done when PostgreSQL starts locally, migrations create the users
table, backend typecheck/test/build pass, and health/db can query the database.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Base repository and user sync service behavior with mocked repository |
| Integration | TypeORM migration path and repository persistence against local Postgres |
| E2E | Not required for DB foundation |
| Platform | `docker compose up -d postgres`, migration run, DB health curl |
| Performance | Not required |
| Logs/Audit | Ensure DB URL is not logged |

## Fixtures

- Clerk subject: `user_test_123`.
- Local Postgres database: `hatnet_demo`.

## Commands

```text
docker compose up -d postgres
pnpm db:migrate
pnpm check
pnpm test
pnpm build
pnpm dev:api
curl -s http://localhost:3000/health/db
```

## Acceptance Evidence

- `docker compose up -d postgres`: started `hatnet-demo-postgres`.
- `pnpm db:migrate`: ran `CreateUsersTable1717200000000`.
- `pnpm check`: passed for API and web workspaces.
- `pnpm test`: passed 4 files / 7 tests total across API and web.
- `pnpm build`: passed API TypeScript build and web Vite build.
- `curl -s http://localhost:3000/health/db`: returned `{"status":"ok","database":"postgres",...}`.
- `docker compose exec -T postgres psql -U hatnet -d hatnet_demo -c "\\dt" -c "\\d users"`: confirmed `migrations` and `users` tables; `users` has UUID PK and unique `(external_auth_provider, external_auth_user_id)`.
