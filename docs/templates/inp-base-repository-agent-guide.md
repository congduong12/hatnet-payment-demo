# INP-Style Base Repository Agent Guide

Use this document as an importable Harness guide for a NestJS + TypeORM backend
that should be written in the style of RTX Internal Portal Backend (INP),
especially around the Base Repository concept.

## Harness Import

Recommended target path in a new Harness project:

```text
docs/architecture/inp-base-repository-agent-guide.md
```

Then add a short pointer from the target project's `AGENTS.md` or architecture
docs:

```md
Before implementing NestJS persistence code, read
`docs/architecture/inp-base-repository-agent-guide.md`.
```

This guide is not a product spec. Treat it as an agent-facing implementation
contract for backend persistence style.

## Evidence Boundary

- `Local`: verified from the INP repository at
  `/Users/mac/SVC/RTX/internal-portal-backend`.
- `Docs`: verified from TypeORM and NestJS official documentation.
- `Upstream`: checked against public TypeORM and NestJS repository/docs
  patterns.
- `Inference`: conclusions drawn from local and public evidence.

## Source Snapshot

`Local`: INP is a NestJS + TypeScript backend using PostgreSQL through TypeORM.
The repo uses two TypeORM data sources: the default application database and a
named Zeus database connection.

`Local`: INP's central persistence abstraction is
`src/core/base/base.repository.ts`. Repository classes extend
`BaseRepository<Entity>` and expose chainable query methods such as
`filterBy*()`, `with*()`, `setPage()`, and `sortBy()`.

`Local`: INP currently has many `BaseRepository` subclasses across feature
modules such as supplier, property, client, mapping, system-log, permission,
role, room-mapping, and dashboard search. This means the pattern is a core
codebase convention rather than a one-off helper.

`Docs`: TypeORM supports the repository pattern, QueryBuilder composition,
parameterized queries, pagination with `skip`/`take`, raw result methods, and
transaction-scoped entity managers.

`Docs`: NestJS providers are singleton-scoped by default. A provider with
mutable query state must be used carefully or wrapped so each query chain gets
an isolated query context.

## Design Goal

Build backend modules where:

- Controllers handle HTTP mapping, auth guards, DTO validation, and response
  boundaries.
- Services orchestrate business behavior, transactions, idempotency, external
  calls, and repository coordination.
- Entities define persistence mapping and domain-relevant fields.
- Repositories own query construction and persistence details.
- ORM-specific APIs stay out of controllers and should rarely appear in
  services.

The desired service call shape should feel like this:

```ts
const supplier = await this.supplierRepository
  .newQuery()
  .filterById(id)
  .withContacts()
  .withMappings()
  .first();
```

## Base Repository Concept

An INP-style Base Repository gives every feature repository a shared query
language:

- `builder()` creates or returns the current TypeORM QueryBuilder.
- `filterBy*()` methods append `WHERE` conditions.
- `with*()` methods append joins or relation loading.
- `setPage()` stores pagination.
- `sortBy()` stores validated sort fields and directions.
- `all()`, `allRaw()`, `first()`, and `count()` execute the query.
- `executeQuery()` resets repository query state after execution.
- `newQuery()` creates an isolated repository instance for an independent query
  chain.

The pattern is useful because services read like business orchestration while
repositories keep SQL details centralized.

## Recommended Greenfield Shape

`Inference`: For a new project, preserve the INP public style but improve the
implementation boundary. Avoid storing mutable query state on a singleton
provider unless every service consistently starts from `newQuery()`.

Recommended options, from safest to closest to INP legacy style:

1. Use a stateless repository where each method creates a fresh QueryBuilder.
2. Use a query-session object returned by `newQuery()`; chain methods mutate
   only that session.
3. Use INP's mutable repository style, but require `newQuery()` for every list
   or multi-step query chain.

Prefer option 1 or 2 in a new codebase. Use option 3 only when exact INP
similarity matters more than concurrency safety.

## Base Repository API Contract

The base repository should expose these concepts:

```ts
export type SortDirection = 'ASC' | 'DESC';

export type Filters = Record<string, unknown>;

export type Paginated<T> = {
  rows: T[];
  count: number;
};
```

Core methods:

```ts
setPage(page: number, limit: number, noCount?: boolean): this
sortBy(field: string, direction?: SortDirection): this
sortByRaw(expression: string, direction?: SortDirection): this
setSort(sorts: Record<string, SortDirection>): this
filterById(id: number | string | Array<number | string>): this
withDeleted(): this
createNew(payload: object): Promise<Entity>
bulkCreate(payload: object[]): Promise<Entity[]>
all(fields?: string[]): Promise<Entity[] | Paginated<Entity>>
allRaw<T = Entity>(fields?: string[]): Promise<T[] | Paginated<T>>
first(): Promise<Entity | null>
count(): Promise<number>
newQuery(): this
```

`first()` should be typed as `Promise<Entity | null>` in a new project. INP has
some older typing that treats `first()` as `Promise<Entity>`, but local rules
already acknowledge that nullable query methods should use `getOne()` through
`executeQuery()`.

## Feature Repository Pattern

Create one repository per persistent aggregate or query-heavy entity.

```ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@/core/base/base.repository';
import { Supplier } from './supplier.entity';

@Injectable()
export class SupplierRepository extends BaseRepository<Supplier> {
  protected readonly alias = 'supplier';

  constructor(entityManager: EntityManager) {
    super(Supplier, entityManager);
  }

  filterById(id: number | number[]): this {
    if (Array.isArray(id)) {
      this.builder().andWhere(`${this.alias}.id IN (:...id)`, { id });
    } else {
      this.builder().andWhere(`${this.alias}.id = :id`, { id });
    }

    return this;
  }

  filterByQuery(query: string): this {
    this
      .builder()
      .andWhere(`${this.alias}.name ILIKE :query`, { query: `%${query}%` });

    return this;
  }

  withContacts(): this {
    this
      .builder()
      .leftJoinAndSelect(`${this.alias}.contacts`, 'contacts');

    return this;
  }
}
```

Rules:

- Name filters by product intent: `filterBySupplierId`,
  `filterByRtxBookingId`, `filterByCountry`, `filterByActive`.
- Name joins with `with*`: `withContacts`, `withMappings`, `withUser`.
- Return `this` from chain methods.
- Use array-aware filters for common `IN (:...ids)` cases.
- Do not put DTO parsing or HTTP-specific behavior in repositories.

## Service List Pattern

Services should hide repository setup in a private `repository(opts)` helper.
This keeps list endpoints consistent and easy for agents to extend.

```ts
type ListOptions = {
  filters?: Filters;
  page?: {
    current: number;
    size: number;
  };
  sort?: string[];
};

@Injectable()
export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async all(opts: ListOptions = {}): Promise<Supplier[] | Paginated<Supplier>> {
    const repo = this.repository(opts);

    return repo.all();
  }

  private repository(opts: ListOptions = {}): SupplierRepository {
    const { filters, page, sort } = opts;
    const repo = this.supplierRepository.newQuery();

    if (page) {
      repo.setPage(page.current, page.size);
    }

    if (filters?.query) {
      repo.filterByQuery(filters.query as string);
    }

    if (sort?.length) {
      const [field, direction] = sort;
      repo.sortBy(field, direction as SortDirection);
    }

    return repo;
  }
}
```

Rules:

- Keep `ListOptions` local to the service unless multiple modules genuinely
  reuse the same contract.
- Apply pagination before executing terminal methods.
- Apply sort through `sortBy()` unless the sort expression is trusted internal
  SQL.
- Avoid broad unbounded `.all()` calls in request paths.

## Module Wiring

Default database:

```ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, SupplierContact]),
  ],
  providers: [
    SupplierRepository,
    SupplierService,
  ],
  exports: [SupplierService, SupplierRepository],
})
export class SupplierModule {}
```

Named database:

```ts
@Module({
  imports: [
    TypeOrmModule.forFeature([RoomMapping], ZEUS_CONNECTION_NAME),
  ],
  providers: [
    RoomMappingRepository,
    RoomMappingService,
  ],
})
export class RoomMappingModule {}
```

Repository constructor for named database:

```ts
constructor(
  @InjectEntityManager(ZEUS_CONNECTION_NAME)
  entityManager: EntityManager,
) {
  super(RoomMapping, entityManager);
}
```

## Transactions

Service methods own transaction boundaries:

```ts
@Transactional()
async store(data: CreateSupplierDto): Promise<Supplier> {
  const supplier = await this.supplierRepository.createNew(data);
  await this.contactService.syncContacts(supplier.id, data.contacts);

  return this.getById(supplier.id, true);
}
```

Named connection transaction:

```ts
@Transactional({ connectionName: ZEUS_CONNECTION_NAME })
async syncRoomMappings(payloads: RoomMappingPayload[]): Promise<void> {
  await this.roomMappingRepository.upsertBatch(payloads);
}
```

`Docs`: TypeORM transactions have their own manager/repository scope. If a
project does not use `typeorm-transactional`, pass the transaction manager
explicitly or use TypeORM's `manager.withRepository(...)` pattern.

## Query Safety Rules

Hard rules for agents:

- Use parameterized queries.
- Never concatenate user input into SQL.
- Use unique parameter names inside one QueryBuilder chain.
- Prefer `Brackets` when mixing `AND` and `OR`.
- Validate sort fields before applying dynamic sort.
- Use `sortByRaw()` only for trusted internal expressions such as
  `LOWER(table.column)` or a fixed `CASE` expression.
- Keep raw SQL in repository methods and document why QueryBuilder is not
  enough.
- Prefer `skip/take` for entity pagination and be careful with joins.
- Avoid `offset/limit` unless the query is raw or the behavior is explicitly
  verified.

## Performance Rules

- Avoid unbounded `.all()` calls on request paths.
- Prefer pagination, batching, or streaming for large datasets.
- Avoid N+1 query patterns; use joins, bulk `IN (:...ids)`, or batch external
  lookups.
- For exported datasets, prefer streaming or chunking over materializing
  everything in memory.
- For upserts, update only intended columns.
- For bulk writes, prefer repository-level bulk operations with explicit
  conflict behavior.

## Testing Expectations

Unit tests can mock chainable repositories:

```ts
const supplierRepository = {
  newQuery: jest.fn().mockReturnThis(),
  setPage: jest.fn().mockReturnThis(),
  sortBy: jest.fn().mockReturnThis(),
  filterByQuery: jest.fn().mockReturnThis(),
  all: jest.fn(),
};
```

Repository/query-heavy behavior should have integration coverage when the SQL
shape matters.

Test the observable behavior:

- filters are applied for the right inputs
- empty arrays short-circuit when appropriate
- pagination returns `{ rows, count }`
- `noCount` paths skip expensive counts
- raw projections return the expected aliases
- transaction methods rollback on failure when behavior is critical

## Agent Checklist

Before writing repository code:

- Read the module's existing service, repository, entity, DTO, and tests.
- Follow neighboring module patterns before introducing a new abstraction.
- Confirm whether the entity uses the default or named data source.
- Decide whether the query returns entities, raw rows, count, or existence.

When adding a repository method:

- Keep it chainable if it only modifies query conditions.
- Make it terminal only if the method name clearly means execution, such as
  `existsByRtxBookingId`, `findByComposite`, or `upsertBatch`.
- Return `[]`, `new Set()`, or `new Map()` early for empty input arrays.
- Reset or isolate query state after execution.

Before finishing:

- Run targeted tests for the changed service/repository.
- Run typecheck when possible.
- If SQL was changed, prefer integration proof or exact query-shape assertions.
- Update this guide if a new repeated repository pattern is introduced.

## Anti-Patterns

Avoid these unless explicitly justified:

- Native TypeORM `findOne`, `findOneBy`, or `findBy` inside a custom repository
  when the project standard is BaseRepository chaining.
- Dynamic raw SQL with user input.
- Shared mutable QueryBuilder state across independent service calls.
- Service methods that assemble complex joins.
- Controllers that know persistence details.
- A global `utils` folder for module-specific query helpers.
- Sorting by arbitrary client-provided fields without validation.
- Returning paginated and non-paginated shapes without a clear service contract.

## Minimal Starter Shape

```text
src/
  core/
    base/
      base.repository.ts
  supplier/
    dto/
      create-supplier.dto.ts
      update-supplier.dto.ts
    supplier.entity.ts
    supplier.repository.ts
    supplier.service.ts
    supplier.controller.ts
    supplier.module.ts
    supplier.service.spec.ts
    supplier.repository.spec.ts
```

Use this shape as a pattern, not a mandatory scaffold. Create real files only
when a story or product slice needs them.

## Source Pack

Local INP files that shaped this guide:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/CODING_GUIDELINES.md`
- `src/core/base/base.repository.ts`
- `src/configs/typeorm.config.ts`
- `src/configs/zeus-typeorm.config.ts`
- `src/app.module.ts`
- `src/main.ts`
- `src/supplier/services/supplier.service.ts`
- `src/supplier/repositories/supplier.repository.ts`
- `src/supplier/repositories/supplier-integration-mapping.repository.ts`
- `src/room-mapping/room-mapping.repository.ts`
- `src/client/client.repository.ts`
- `src/client/client-app-ip/client-app-ip.repository.ts`
- `src/system-log/system-log.repository.ts`

Official docs checked:

- TypeORM custom repositories
- TypeORM SelectQueryBuilder
- TypeORM transactions
- TypeORM Repository API
- NestJS database techniques
- NestJS injection scopes

