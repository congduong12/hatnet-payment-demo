# Design

## Domain Model

Internal user records use the verified Clerk subject as the external auth user
ID. MVP foundation stores users in memory until the persistence story introduces
PostgreSQL tables.

User fields:

- `id`
- `externalAuthProvider`
- `externalAuthUserId`
- `email`
- `name`
- `avatarUrl`
- `currentPlan`
- `createdAt`
- `updatedAt`

Rules:

- Backend never trusts a user ID supplied by the client.
- New synced users default to `FREE`.
- The in-memory store is development-only and must be replaced by database
  persistence before checkout/payment stories.

## Application Flow

Frontend:

1. Wrap React app in `<ClerkProvider>`.
2. Render sign-in/sign-up controls for signed-out users.
3. Render `UserButton` and sync controls for signed-in users.
4. Use `useAuth().getToken()` for cross-origin API requests.
5. Send `Authorization: Bearer <session token>`.

Backend:

1. `ClerkAuthGuard` reads `Authorization` header.
2. `ClerkAuthService` verifies the session token with Clerk backend utilities.
3. Guard attaches the verified auth context to the request.
4. `UsersService.syncFromAuth()` creates or updates an internal user.
5. `GET /me` returns verified auth plus internal user.
6. `POST /auth/sync-user` returns the internal user record.

## Interface Contract

`GET /me`

- `401` when token is missing, malformed, expired, or invalid.
- `200` with `{ auth, user }` when token is valid.

`POST /auth/sync-user`

- `401` when token is missing, malformed, expired, or invalid.
- `200` with `{ user }` after create/update by verified auth identity.

## Data Model

No database schema is introduced in this story. The internal user store is
in-memory only so later persistence work can introduce TypeORM/Postgres without
mixing auth boundary proof with migration work.

## UI / Platform Impact

The React shell now requires `VITE_CLERK_PUBLISHABLE_KEY` for live Clerk usage.
If no publishable key exists, the app renders a clear setup message instead of
crashing.

## Observability

Do not log tokens or Clerk secrets. Future structured request logging should log
auth result category only, not raw credentials.

## Alternatives Considered

1. Same-origin cookie auth.
2. DIY JWT/refresh tokens.
3. Clerk webhook-first sync.
4. Database user table in this story.

Cross-origin bearer token auth is selected because the current app has separate
Vite and NestJS dev origins.
