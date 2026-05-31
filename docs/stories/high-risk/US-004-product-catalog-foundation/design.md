# Design

## Data Model

`products` stores the MVP catalog in PostgreSQL.

Key fields:

- `id`: UUID primary key.
- `name`, `slug`, `description`, `short_description`.
- `product_type`: `ONE_TIME` or `PLAN`.
- `price_amount`: integer minor-unit amount.
- `price_currency`: ISO-like display currency for this demo.
- `display_price`: frontend-friendly preview string.
- `category`, `tags`, `is_active`, `metadata`.

`slug` is unique and used for product detail lookup.

## API Shape

- `GET /products` returns active products only.
- `GET /products/:slug` returns one active product or 404.

The response maps database snake_case columns into stable camelCase API fields.

## Frontend Shape

The React shell fetches `/products` on load and renders loading, error, empty,
and loaded states. It does not implement cart actions in this story.

## Repository Pattern

`ProductRepository` extends the `BaseRepository` foundation from US-003 and
keeps query state scoped to each method call.
