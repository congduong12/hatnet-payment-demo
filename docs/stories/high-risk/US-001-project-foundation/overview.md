# Overview

## Current Behavior

Before this story, the repository contained Harness docs, `SPEC.md`, templates,
and the Rust Harness CLI. There was no NestJS backend, React frontend, package
manager configuration, application environment contract, database setup, or app
validation command.

## Target Behavior

The repo has a minimal but real project foundation for the selected stack:

- `apps/api` NestJS backend with a health/smoke endpoint.
- `apps/web` React frontend with a first app shell that represents backend health.
- Shared TypeScript/pnpm workspace setup.
- Environment template with non-secret variable names.
- Local development and quick validation commands.
- Product docs, decisions, story, and matrix rows are current.

## Affected Users

- Developer learning the payment flow.
- Coding agent implementing future stories.
- Reviewer validating future MVP slices.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/domain-contract.md`
- `docs/product/api-contract.md`
- `docs/product/validation-contract.md`

## Non-Goals

- Clerk login.
- Database schema for product/cart/order/payment/points.
- payOS integration.
- Gemini integration.
- Pro subscription behavior.
- Admin/dev inspection functionality beyond a placeholder shell if useful.
- Production deployment.
