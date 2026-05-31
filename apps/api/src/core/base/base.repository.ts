import { EntityManager, EntityTarget, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export type SortDirection = 'ASC' | 'DESC';

export type Paginated<T> = {
  rows: T[];
  count: number;
};

export abstract class BaseRepository<Entity extends ObjectLiteral> {
  protected constructor(
    private readonly entity: EntityTarget<Entity>,
    protected readonly entityManager: EntityManager,
    protected readonly alias: string,
  ) {}

  newQuery(): RepositoryQuery<Entity> {
    return new RepositoryQuery(this.entityManager.createQueryBuilder(this.entity, this.alias));
  }
}

export class RepositoryQuery<Entity extends ObjectLiteral> {
  private page?: { current: number; size: number; noCount?: boolean };

  constructor(private readonly queryBuilder: SelectQueryBuilder<Entity>) {}

  builder(): SelectQueryBuilder<Entity> {
    return this.queryBuilder;
  }

  filterById(id: string | string[]): this {
    if (Array.isArray(id)) {
      this.queryBuilder.andWhere(`${this.queryBuilder.alias}.id IN (:...id)`, { id });
    } else {
      this.queryBuilder.andWhere(`${this.queryBuilder.alias}.id = :id`, { id });
    }

    return this;
  }

  setPage(page: number, limit: number, noCount = false): this {
    this.page = { current: page, size: limit, noCount };
    this.queryBuilder.skip((page - 1) * limit).take(limit);

    return this;
  }

  sortBy(field: string, direction: SortDirection = 'ASC'): this {
    this.queryBuilder.addOrderBy(`${this.queryBuilder.alias}.${field}`, direction);

    return this;
  }

  async all(): Promise<Entity[] | Paginated<Entity>> {
    if (this.page && !this.page.noCount) {
      const [rows, count] = await this.queryBuilder.getManyAndCount();
      return { rows, count };
    }

    return this.queryBuilder.getMany();
  }

  async first(): Promise<Entity | null> {
    return this.queryBuilder.getOne();
  }

  async count(): Promise<number> {
    return this.queryBuilder.getCount();
  }
}
