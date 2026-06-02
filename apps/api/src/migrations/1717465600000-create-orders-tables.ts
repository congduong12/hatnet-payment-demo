import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTables1717465600000 implements MigrationInterface {
  name = 'CreateOrdersTables1717465600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "status" varchar(32) NOT NULL,
        "subtotal_amount" integer NOT NULL,
        "discount_amount" integer NOT NULL,
        "payable_amount" integer NOT NULL,
        "checkout_currency" varchar(8) NOT NULL,
        "fx_rate" integer NOT NULL,
        "fx_source" varchar(64) NOT NULL,
        "fx_applied_at" timestamptz NOT NULL,
        "rounding_mode" varchar(64) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "CHK_orders_amounts" CHECK (
          "subtotal_amount" >= 0
          AND "discount_amount" >= 0
          AND "payable_amount" >= 0
          AND "subtotal_amount" >= "discount_amount"
        ),
        CONSTRAINT "CHK_orders_fx_rate" CHECK ("fx_rate" > 0),
        CONSTRAINT "CHK_orders_checkout_currency" CHECK ("checkout_currency" = 'VND')
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")');

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "product_name" varchar(160) NOT NULL,
        "product_metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "quantity" integer NOT NULL,
        "original_price_amount" integer NOT NULL,
        "original_price_currency" varchar(8) NOT NULL,
        "checkout_unit_price_amount" integer NOT NULL,
        "checkout_line_amount" integer NOT NULL,
        "checkout_currency" varchar(8) NOT NULL,
        "fx_rate" integer NOT NULL,
        "fx_source" varchar(64) NOT NULL,
        "fx_applied_at" timestamptz NOT NULL,
        "rounding_mode" varchar(64) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
        CONSTRAINT "CHK_order_items_quantity" CHECK ("quantity" >= 1 AND "quantity" <= 10),
        CONSTRAINT "CHK_order_items_amounts" CHECK (
          "original_price_amount" >= 0
          AND "checkout_unit_price_amount" >= 0
          AND "checkout_line_amount" >= 0
        ),
        CONSTRAINT "CHK_order_items_fx_rate" CHECK ("fx_rate" > 0),
        CONSTRAINT "CHK_order_items_checkout_currency" CHECK ("checkout_currency" = 'VND')
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_order_items_order_id"');
    await queryRunner.query('DROP TABLE "order_items"');
    await queryRunner.query('DROP INDEX "IDX_orders_user_id"');
    await queryRunner.query('DROP TABLE "orders"');
  }
}

