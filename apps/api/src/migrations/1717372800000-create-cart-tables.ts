import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartTables1717372800000 implements MigrationInterface {
  name = 'CreateCartTables1717372800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_carts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_carts_active_user"
      ON "carts" ("user_id")
      WHERE "status" = 'ACTIVE'
    `);
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "cart_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_cart_items_cart_product" UNIQUE ("cart_id", "product_id"),
        CONSTRAINT "CHK_cart_items_quantity" CHECK ("quantity" >= 1 AND "quantity" <= 10)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "cart_items"');
    await queryRunner.query('DROP INDEX "IDX_carts_active_user"');
    await queryRunner.query('DROP TABLE "carts"');
  }
}
