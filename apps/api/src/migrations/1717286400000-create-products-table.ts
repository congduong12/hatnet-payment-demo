import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1717286400000 implements MigrationInterface {
  name = 'CreateProductsTable1717286400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(160) NOT NULL,
        "slug" varchar(180) NOT NULL,
        "description" text NOT NULL,
        "short_description" varchar(280) NOT NULL,
        "product_type" varchar(32) NOT NULL,
        "price_amount" integer NOT NULL,
        "price_currency" varchar(8) NOT NULL,
        "display_price" varchar(64) NOT NULL,
        "category" varchar(80) NOT NULL,
        "tags" text[] NOT NULL DEFAULT '{}',
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "products" (
        "name",
        "slug",
        "description",
        "short_description",
        "product_type",
        "price_amount",
        "price_currency",
        "display_price",
        "category",
        "tags",
        "metadata"
      )
      VALUES
        (
          'Free Plan',
          'free-plan',
          'Default learning-lab access for authenticated users before any checkout flow is started.',
          'Default access for new users.',
          'PLAN',
          0,
          'USD',
          '$0',
          'Plan',
          ARRAY['plan', 'free'],
          '{"plan":"FREE","requiresPayment":false}'::jsonb
        ),
        (
          'Pro Plan',
          'pro-plan',
          'Simulated monthly Pro subscription purchased through a Vietnam checkout flow.',
          'Monthly Pro access with points reward.',
          'PLAN',
          1000,
          'USD',
          '$10',
          'Plan',
          ARRAY['plan', 'pro', 'subscription'],
          '{"plan":"PRO","rewardPoints":10,"billingPeriodDays":30}'::jsonb
        ),
        (
          'NestJS Payment Workshop',
          'nestjs-payment-workshop',
          'A one-time workshop product for learning backend-first payment orchestration and webhook verification.',
          'Backend-first payment workshop.',
          'ONE_TIME',
          4900,
          'USD',
          '$49',
          'Workshop',
          ARRAY['nestjs', 'payments', 'webhook'],
          '{"difficulty":"intermediate","format":"workshop"}'::jsonb
        ),
        (
          'React Checkout UI Kit',
          'react-checkout-ui-kit',
          'A demo UI kit for cart, checkout, and payment status screens in a React application.',
          'Checkout UI components for React.',
          'ONE_TIME',
          2900,
          'USD',
          '$29',
          'UI Kit',
          ARRAY['react', 'checkout', 'ui'],
          '{"difficulty":"beginner","format":"template"}'::jsonb
        ),
        (
          'Gemini Product Search Pack',
          'gemini-product-search-pack',
          'A demo product pack for comparing deterministic search with Gemini-assisted product ranking.',
          'LLM-assisted product search demo.',
          'ONE_TIME',
          1900,
          'USD',
          '$19',
          'AI Search',
          ARRAY['gemini', 'search', 'ai'],
          '{"difficulty":"advanced","format":"search-pack"}'::jsonb
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "products"');
  }
}
