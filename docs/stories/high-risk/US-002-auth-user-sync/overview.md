# Overview

## Current Behavior

The app has a NestJS health endpoint and a React shell, but no authentication
boundary. There is no way for the backend to identify a user, no internal user
record, and no protected API route.

## Target Behavior

React uses Clerk for sign-in/sign-out state. The frontend sends Clerk session
tokens to the NestJS API for cross-origin requests. NestJS verifies the token,
derives identity server-side, and exposes:

- `GET /me`
- `POST /auth/sync-user`

The backend creates or returns an internal user record keyed by the verified
Clerk subject. Client-supplied `userId` is ignored.

## Affected Users

- Authenticated demo users.
- Future checkout/cart/billing users.
- Developers testing protected API behavior.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/domain-contract.md`
- `docs/product/api-contract.md`
- `docs/product/validation-contract.md`

## Non-Goals

- Password or DIY JWT auth.
- Database-backed persistence.
- Roles/RBAC.
- Admin permissions.
- Clerk webhook user sync.
- Checkout/cart/billing behavior.
