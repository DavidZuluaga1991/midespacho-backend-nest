import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema20260305013000 implements MigrationInterface {
  name = 'CreateInitialSchema20260305013000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'LAWYER', 'ASSISTANT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "case_status_enum" AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(120) NOT NULL,
        "email" character varying(160) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'ASSISTANT',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "full_name" character varying(150) NOT NULL,
        "document_number" character varying(50) NOT NULL,
        "phone" character varying(30),
        "email" character varying(160),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_clients_document_number" UNIQUE ("document_number")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cases" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(40) NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "status" "case_status_enum" NOT NULL DEFAULT 'OPEN',
        "opened_at" TIMESTAMPTZ NOT NULL,
        "closed_at" TIMESTAMPTZ,
        "client_id" uuid NOT NULL,
        "created_by_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cases_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cases_code" UNIQUE ("code"),
        CONSTRAINT "FK_cases_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_cases_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "file_batches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "case_id" uuid NOT NULL,
        "title" character varying(120) NOT NULL,
        "description" text NOT NULL,
        "uploaded_by_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_file_batches_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_file_batches_case_id" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_file_batches_uploaded_by_id" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "case_files" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "case_id" uuid NOT NULL,
        "batch_id" uuid NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "stored_name" character varying(255) NOT NULL,
        "mime_type" character varying(120) NOT NULL,
        "size_bytes" bigint NOT NULL,
        "storage_provider" character varying(50) NOT NULL,
        "storage_key" character varying(255) NOT NULL,
        "public_url" text NOT NULL,
        "uploaded_by_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_case_files_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_case_files_case_id" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_case_files_batch_id" FOREIGN KEY ("batch_id") REFERENCES "file_batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_case_files_uploaded_by_id" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_cases_client_status" ON "cases" ("client_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_batches_case_id_created_at" ON "file_batches" ("case_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_batches_case_id_created_at_desc" ON "file_batches" ("case_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_case_files_case_id" ON "case_files" ("case_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_case_files_batch_id" ON "case_files" ("batch_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_case_files_case_id_created_at" ON "case_files" ("case_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_case_files_case_id_created_at_desc" ON "case_files" ("case_id", "created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_case_files_case_id_created_at_desc"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_case_files_case_id_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_case_files_batch_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_case_files_case_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_file_batches_case_id_created_at_desc"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_file_batches_case_id_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cases_client_status"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "case_files"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "file_batches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cases"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "case_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
