# Design

## Domain Model

Persist the internal user aggregate introduced in US-002.

User table fields:

- `id`
- `external_auth_provider`
- `external_auth_user_id`
- `email`
- `name`
- `avatar_url`
- `current_plan`
- `created_at`
- `updated_at`

Unique constraint:

- `(external_auth_provider, external_auth_user_id)`

## Application Flow

1. Local developer starts PostgreSQL with Docker Compose.
2. Developer runs TypeORM migrations.
3. NestJS starts with `TypeOrmModule.forRootAsync`.
4. `UsersService.syncFromAuth()` uses `UserRepository` to find or create user.
5. `GET /health/db` runs a minimal database proof query.

## Interface Contract

- `GET /health` remains app smoke proof.
- `GET /health/db` returns `{ status, database, timestamp }` when DB is reachable.
- `GET /me` and `POST /auth/sync-user` continue returning internal user records.

## Data Model

Use TypeORM migrations with `synchronize: false`.

The first migration creates `users`. Later stories should add product/cart/order
tables through new migrations.

## UI / Platform Impact

No frontend feature change is required. `.env.example` and README document DB
setup commands.

## Observability

Do not log `DATABASE_URL`. Health endpoints should expose only reachability, not
connection secrets or database internals.

## Alternatives Considered

1. Keep in-memory users until product/cart.
2. Use TypeORM `synchronize: true`.
3. Use Prisma instead of TypeORM.
4. Create all MVP tables now.

The selected path creates only the persistence foundation needed now and leaves
domain tables to their own stories.
