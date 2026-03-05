import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { unlink } from 'fs/promises';
import { join, resolve } from 'path';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

const randomToken = (): string =>
  `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

interface IdRow {
  id: string;
}

interface StorageRow {
  storage_key: string;
  storage_provider: string;
}

interface CountRow {
  count: number;
}

interface UploadFilesResponseBody {
  batch: { title: string };
  files: Array<{ originalName: string }>;
}

interface ListFilesResponseBody {
  meta: { total: number };
  data: Array<{ originalName: string }>;
}

describe('Case files (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdCaseIds: string[] = [];
  let createdClientIds: string[] = [];

  beforeAll(async () => {
    process.env.STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? 'local';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    if (createdCaseIds.length) {
      const rows = await dataSource.query<StorageRow[]>(
        `SELECT "storage_key", "storage_provider" FROM "case_files" WHERE "case_id" = ANY($1::uuid[])`,
        [createdCaseIds],
      );

      const uploadsDir = resolve(
        process.cwd(),
        process.env.LOCAL_UPLOADS_DIR ?? 'uploads',
      );
      await Promise.all(
        rows
          .filter((row) => row.storage_provider === 'local')
          .map((row) =>
            unlink(join(uploadsDir, row.storage_key)).catch(() => undefined),
          ),
      );

      await dataSource.query(
        `DELETE FROM "cases" WHERE "id" = ANY($1::uuid[])`,
        [createdCaseIds],
      );
      createdCaseIds = [];
    }

    if (createdClientIds.length) {
      await dataSource.query(
        `DELETE FROM "clients" WHERE "id" = ANY($1::uuid[])`,
        [createdClientIds],
      );
      createdClientIds = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  const createCaseSeed = async (): Promise<string> => {
    const token = randomToken();

    const [client] = await dataSource.query<IdRow[]>(
      `
      INSERT INTO "clients" ("full_name", "document_number", "phone", "email")
      VALUES ($1, $2, $3, $4)
      RETURNING "id"
      `,
      [`Cliente ${token}`, `DOC-${token}`, null, null],
    );
    createdClientIds.push(client.id);

    const [caseRow] = await dataSource.query<IdRow[]>(
      `
      INSERT INTO "cases" ("code", "title", "description", "status", "opened_at", "closed_at", "client_id", "created_by_id")
      VALUES ($1, $2, $3, $4, NOW(), NULL, $5, NULL)
      RETURNING "id"
      `,
      [`EXP-${token}`, `Case ${token}`, null, 'OPEN', client.id],
    );
    createdCaseIds.push(caseRow.id);

    return caseRow.id;
  };

  it('POST /api/v1/cases/:id/files should upload files and persist metadata', async () => {
    const caseId = await createCaseSeed();
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const httpRequest = request as unknown as (
      app: Parameters<typeof request>[0],
    ) => ReturnType<typeof request>;

    const response = await httpRequest(httpServer)
      .post(`/api/v1/cases/${caseId}/files`)
      .field('batchTitle', 'Lote Inicial')
      .field('batchDescription', 'Descripcion valida para el primer lote')
      .attach('files', Buffer.from('alpha'), {
        filename: 'alpha.txt',
        contentType: 'text/plain',
      })
      .attach('files', Buffer.from('beta'), {
        filename: 'beta.txt',
        contentType: 'text/plain',
      })
      .expect(201);

    const body = response.body as UploadFilesResponseBody;
    expect(body.batch.title).toBe('Lote Inicial');
    expect(body.files).toHaveLength(2);

    const [countRow] = await dataSource.query<CountRow[]>(
      `SELECT COUNT(*)::int AS count FROM "case_files" WHERE "case_id" = $1`,
      [caseId],
    );
    expect(countRow.count).toBe(2);
  });

  it('GET /api/v1/cases/:id/files should list uploaded files', async () => {
    const caseId = await createCaseSeed();
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const httpRequest = request as unknown as (
      app: Parameters<typeof request>[0],
    ) => ReturnType<typeof request>;

    await httpRequest(httpServer)
      .post(`/api/v1/cases/${caseId}/files`)
      .field('batchTitle', 'Lote Unico')
      .field('batchDescription', 'Descripcion valida del lote unico')
      .attach('files', Buffer.from('contract-content'), {
        filename: 'contract.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const response = await httpRequest(httpServer)
      .get(`/api/v1/cases/${caseId}/files?page=1&limit=10`)
      .expect(200);

    const body = response.body as ListFilesResponseBody;
    expect(body.meta.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].originalName).toBe('contract.pdf');
  });
});
