# Exec Plan

## Goal

Create the immutable order and VND pricing foundation needed before points and
payOS payment orchestration.

## Scope

In scope:

- Integer-safe USD cents to VND conversion and round-up utility.
- Validated static `USD_TO_VND_RATE`.
- Order and order-item entities plus migration.
- Transactional checkout preparation service.
- Focused unit and PostgreSQL integration proof.

Out of scope:

- Public checkout controller.
- Payment attempt persistence and payOS integration.
- Reward ledger and points reservation.
- Checkout browser UI.

## Risk Classification

Risk flags:

- Data model.
- Public contract adjacency.
- Existing cart behavior.
- Weak proof until transaction integration tests exist.

Hard gates:

- Money calculation.
- Transactional persistence before payment work.

## Work Phases

1. Add integer-safe money conversion utility and unit tests.
2. Add order entities, migration, and TypeORM registration.
3. Add repository and transactional checkout preparation service.
4. Add empty-cart, inactive-product, snapshot, and rollback proof.
5. Run repository checks, DB migration proof, and Harness updates.

## Stop Conditions

Pause for human confirmation if:

- A public `POST /checkout` endpoint is required before payOS is implemented.
- The FX config representation changes from integer VND per USD.
- Cart-closing behavior needs a different product rule.
- Validation requirements need to be weakened.

