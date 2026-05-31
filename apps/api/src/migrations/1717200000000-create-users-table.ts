import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1717200000000 implements MigrationInterface {
  name = 'CreateUsersTable1717200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "external_auth_provider" varchar(32) NOT NULL,
        "external_auth_user_id" varchar(128) NOT NULL,
        "email" varchar(320),
        "name" varchar(160),
        "avatar_url" text,
        "current_plan" varchar(32) NOT NULL DEFAULT 'FREE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_external_auth" UNIQUE ("external_auth_provider", "external_auth_user_id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
