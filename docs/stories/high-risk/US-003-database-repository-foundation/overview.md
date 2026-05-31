# Overview

## Current Behavior

Auth and user sync exist, but internal users are stored in memory. The repo has
no local PostgreSQL container, no TypeORM data source, no migrations, and no
repository foundation for future product/cart/order/payment work.

## Target Behavior

The backend connects to local PostgreSQL through TypeORM, uses migrations
instead of `synchronize: true`, persists internal users, and exposes a database
health smoke endpoint.

## Affected Users

- Developers running the app locally.
- Future product/cart/checkout implementers.
- Authenticated users whose internal profile should persist across restarts.

## Affected Product Docs

- `docs/product/domain-contract.md`
- `docs/product/api-contract.md`
- `docs/product/validation-contract.md`

## Non-Goals

- Product/cart tables.
- Checkout/order/payment/points schema.
- Production deployment database provisioning.
- TypeORM transaction decorator framework.
- Seed data beyond schema migration.
