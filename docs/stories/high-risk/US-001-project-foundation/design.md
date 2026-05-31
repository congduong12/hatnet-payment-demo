# Design

## Domain Model

No product domain model is implemented in this story.

The story only creates the application foundation needed by later domain
stories. Any sample data must be clearly marked as seed/demo placeholder and
must not become product truth.

## Application Flow

Backend:

- Start NestJS app.
- Load validated environment.
- Expose a health/smoke endpoint such as `GET /health`.
- Emit structured request logs if the scaffold can do so without overbuilding.

Frontend:

- Start React app.
- Render the VN Payment Learning Lab shell.
- Include a simple API health state or static development status section.

## Interface Contract

Initial API:

- `GET /health`

Expected response:

- `status`
- `service`
- `timestamp`

The endpoint is smoke proof only and does not create a public product contract
beyond app availability.

## Data Model

No application schema is created in this story unless the chosen scaffold
requires a basic connectivity check. If Postgres connectivity is included, it
must not create product tables for future domains.

## UI / Platform Impact

Frontend should be a real React app surface, not a static HTML placeholder.
Design fidelity work can stay minimal for Phase 0, but the structure should be
ready for Build Web Apps and browser QA in future stories.

## Observability

The backend should prepare for the repo architecture rule of one canonical JSON
request log line per request. If full logging is not added in Phase 0, record it
as a follow-up before payment/webhook work.

## Alternatives Considered

1. Scaffold all MVP domains immediately.
2. Build frontend-only prototype first.
3. Use Next.js full-stack instead of separate NestJS and React apps.

The selected approach keeps Phase 0 narrow and avoids creating domain schema
before the first real vertical slice.
