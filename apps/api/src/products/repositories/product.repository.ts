import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository.js';
import { ProductEntity } from '../entities/product.entity.js';

@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(ProductEntity, entityManager, 'product');
  }

  async findActive(): Promise<ProductEntity[]> {
    return this.newQuery()
      .builder()
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.category', 'ASC')
      .addOrderBy('product.name', 'ASC')
      .getMany();
  }

  async findActiveBySlug(slug: string): Promise<ProductEntity | null> {
    return this.newQuery()
      .builder()
      .andWhere('product.slug = :slug', { slug })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getOne();
  }
}
