# 0006 Application Stack

Date: 2026-06-01

## Status

Accepted

## Context

`SPEC.md` requires a NestJS backend and ReactJS frontend. The repository
currently contains Harness docs and no application source. The first buildout
needs a stack decision that gives agents a stable scaffold target without
turning the product spec into implementation churn.

The project also imports an INP-style repository guide that favors NestJS,
TypeScript, PostgreSQL, TypeORM, service-owned transactions, and repository
query composition.

## Decision

Use TypeScript throughout.

Use NestJS for the backend API and React for the frontend browser app. Prefer a
monorepo layout with separate app surfaces:

```text
apps/api
apps/web
```

Use PostgreSQL for application data. Prefer TypeORM for backend persistence so
the project can follow the INP-style repository guide, but implement the
greenfield-safe variant: stateless repositories or isolated query sessions
rather than mutable singleton query state.

Use Vite for the React frontend unless a future story explicitly selects
Next.js. This preserves the user's ReactJS requirement and keeps the NestJS API
as the backend source of truth.

## Alternatives Considered

1. Next.js full-stack app.
2. NestJS backend plus Next.js frontend.
3. Prisma instead of TypeORM.
4. Single package app without `apps/api` and `apps/web`.

## Consequences

Positive:

- Clear separation between backend API contracts and frontend UI.
- Backend can model payment, ledger, subscription, and webhook transactions in a NestJS-native way.
- React frontend can use Build Web Apps skills and browser QA without forcing Next.js routing.
- TypeORM aligns with the imported INP repository guide.

Tradeoffs:

- Vercel plugin skills that assume Next.js must be adapted carefully.
- Backend deployment target needs a later decision because a long-running NestJS service may not map cleanly to all Vercel defaults.
- TypeORM query-session discipline must be enforced to avoid shared mutable repository state.

## Follow-Up

- Create Phase 0 scaffold story before application code.
- Add env validation and dev commands for both app surfaces.
- Record a separate deployment decision before claiming Vercel production readiness.
