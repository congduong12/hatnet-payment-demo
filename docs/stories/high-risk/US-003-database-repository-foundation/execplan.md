# Exec Plan

## Goal

Create the durable database and repository rails needed before product/cart
state is implemented.

## Scope

In scope:

- Docker Compose PostgreSQL.
- TypeORM config and DataSource.
- Migration scripts.
- BaseRepository foundation.
- User entity and repository.
- Persisted user sync.
- `GET /health/db`.
- Tests and Harness matrix updates.

Out of scope:

- Product/cart/order/payment schema.
- Provider integrations.
- Production DB provisioning.

## Risk Classification

Risk flags:

- Data model.
- Public contracts.
- Weak proof if Docker/Postgres is unavailable.

Hard gates:

- Data model.

Lane: high-risk.

## Work Phases

1. Verify current NestJS/TypeORM docs and package versions.
2. Add Docker Compose and env defaults.
3. Add TypeORM connection and migration setup.
4. Add BaseRepository and persisted users.
5. Add DB health endpoint.
6. Run Docker, migration, checks, tests, build, and curl proof.
7. Update Harness records and trace.

## Stop Conditions

Pause for human confirmation if:

- Local Docker cannot start.
- Migration would need destructive changes.
- TypeORM setup conflicts with NestJS app startup.
