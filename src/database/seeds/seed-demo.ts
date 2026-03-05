import 'dotenv/config';
import AppDataSource from '../data-source';

const DEMO_CLIENT_ID = 'bb5b80b7-27ff-4ef3-98ad-0a21c15eb001';
const DEMO_CASE_ID = 'b8e5a63e-f8d3-427f-8f59-1f30fce8d001';
const DEMO_BATCH_ID = 'bf4b6b85-fefa-482f-a042-ec1ac2b9e001';
const DEMO_FILE_A_ID = '28ed2f12-0139-4be3-a9d8-f2e5ea44f001';
const DEMO_FILE_B_ID = '482a9cd7-91db-49f9-89d5-7e5fc1082001';

const seed = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.transaction(async (manager) => {
    await manager.query(
      `
      INSERT INTO "clients" ("id", "full_name", "document_number", "phone", "email")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO UPDATE
      SET
        "full_name" = EXCLUDED."full_name",
        "document_number" = EXCLUDED."document_number",
        "phone" = EXCLUDED."phone",
        "email" = EXCLUDED."email",
        "updated_at" = now()
      `,
      [
        DEMO_CLIENT_ID,
        'Cliente Demo MiDespacho',
        'DEMO-CLIENT-001',
        '+57 3000000000',
        'cliente.demo@midespacho.local',
      ],
    );

    await manager.query(
      `
      INSERT INTO "cases" (
        "id",
        "code",
        "title",
        "description",
        "status",
        "opened_at",
        "closed_at",
        "client_id",
        "created_by_id"
      )
      VALUES ($1, $2, $3, $4, $5, now(), NULL, $6, NULL)
      ON CONFLICT ("id") DO UPDATE
      SET
        "code" = EXCLUDED."code",
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "status" = EXCLUDED."status",
        "opened_at" = EXCLUDED."opened_at",
        "closed_at" = EXCLUDED."closed_at",
        "client_id" = EXCLUDED."client_id",
        "updated_at" = now()
      `,
      [
        DEMO_CASE_ID,
        'EXP-DEMO-001',
        'Expediente demo: proceso laboral',
        'Expediente de demostracion para pruebas de carga y listado de archivos.',
        'OPEN',
        DEMO_CLIENT_ID,
      ],
    );

    await manager.query(
      `
      INSERT INTO "file_batches" ("id", "case_id", "title", "description", "uploaded_by_id")
      VALUES ($1, $2, $3, $4, NULL)
      ON CONFLICT ("id") DO UPDATE
      SET
        "case_id" = EXCLUDED."case_id",
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "updated_at" = now()
      `,
      [
        DEMO_BATCH_ID,
        DEMO_CASE_ID,
        'Lote inicial demo',
        'Documentos de ejemplo para validar UI y comportamiento del listado.',
      ],
    );

    await manager.query(
      `
      INSERT INTO "case_files" (
        "id",
        "case_id",
        "batch_id",
        "original_name",
        "stored_name",
        "mime_type",
        "size_bytes",
        "storage_provider",
        "storage_key",
        "public_url",
        "uploaded_by_id"
      )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL),
        ($11, $2, $3, $12, $13, $14, $15, $8, $16, $17, NULL)
      ON CONFLICT ("id") DO UPDATE
      SET
        "case_id" = EXCLUDED."case_id",
        "batch_id" = EXCLUDED."batch_id",
        "original_name" = EXCLUDED."original_name",
        "stored_name" = EXCLUDED."stored_name",
        "mime_type" = EXCLUDED."mime_type",
        "size_bytes" = EXCLUDED."size_bytes",
        "storage_provider" = EXCLUDED."storage_provider",
        "storage_key" = EXCLUDED."storage_key",
        "public_url" = EXCLUDED."public_url",
        "deleted_at" = NULL,
        "updated_at" = now()
      `,
      [
        DEMO_FILE_A_ID,
        DEMO_CASE_ID,
        DEMO_BATCH_ID,
        'demanda-inicial.pdf',
        'seed-demanda-inicial.pdf',
        'application/pdf',
        284312,
        'seed',
        'seed-demanda-inicial.pdf',
        'https://example.com/seed/demanda-inicial.pdf',
        DEMO_FILE_B_ID,
        'poder-especial.pdf',
        'seed-poder-especial.pdf',
        'application/pdf',
        194210,
        'seed-poder-especial.pdf',
        'https://example.com/seed/poder-especial.pdf',
      ],
    );
  });

  console.log('Seed demo ejecutado correctamente.');
  console.log(`Client ID: ${DEMO_CLIENT_ID}`);
  console.log(`Case ID:   ${DEMO_CASE_ID}`);
};

void seed()
  .catch((error: unknown) => {
    console.error('Error ejecutando seed demo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

