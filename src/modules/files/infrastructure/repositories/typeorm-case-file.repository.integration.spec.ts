import { DataSource } from 'typeorm';
import AppDataSource from '../../../../database/data-source';
import { TypeOrmCaseFileRepository } from './typeorm-case-file.repository';

const randomToken = (): string =>
  `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

interface IdRow {
  id: string;
}

describe('TypeOrmCaseFileRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: TypeOrmCaseFileRepository;
  let createdCaseIds: string[];
  let createdClientIds: string[];

  beforeAll(async () => {
    dataSource = AppDataSource;
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    repository = new TypeOrmCaseFileRepository(dataSource);
  });

  beforeEach(() => {
    createdCaseIds = [];
    createdClientIds = [];
  });

  afterEach(async () => {
    if (createdCaseIds.length) {
      await dataSource.query(
        `DELETE FROM "cases" WHERE "id" = ANY($1::uuid[])`,
        [createdCaseIds],
      );
    }
    if (createdClientIds.length) {
      await dataSource.query(
        `DELETE FROM "clients" WHERE "id" = ANY($1::uuid[])`,
        [createdClientIds],
      );
    }
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  const createCaseAndBatch = async (): Promise<{
    caseId: string;
    batchId: string;
  }> => {
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

    const [batch] = await dataSource.query<IdRow[]>(
      `
      INSERT INTO "file_batches" ("case_id", "title", "description", "uploaded_by_id")
      VALUES ($1, $2, $3, NULL)
      RETURNING "id"
      `,
      [caseRow.id, `Batch ${token}`, 'Descripcion del lote'],
    );

    return { caseId: caseRow.id, batchId: batch.id };
  };

  it('should list files with pagination', async () => {
    const { caseId, batchId } = await createCaseAndBatch();

    await repository.createMany([
      {
        caseId,
        batchId,
        originalName: 'a.txt',
        storedName: 'a-stored',
        mimeType: 'text/plain',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'a-stored',
        publicUrl: 'http://localhost/uploads/a-stored',
        uploadedById: null,
      },
      {
        caseId,
        batchId,
        originalName: 'b.txt',
        storedName: 'b-stored',
        mimeType: 'text/plain',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'b-stored',
        publicUrl: 'http://localhost/uploads/b-stored',
        uploadedById: null,
      },
      {
        caseId,
        batchId,
        originalName: 'c.txt',
        storedName: 'c-stored',
        mimeType: 'text/plain',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'c-stored',
        publicUrl: 'http://localhost/uploads/c-stored',
        uploadedById: null,
      },
    ]);

    const result = await repository.listByCaseId({ caseId, page: 1, limit: 2 });

    expect(result.total).toBe(3);
    expect(result.data).toHaveLength(2);
    expect(result.data.every((file) => file.caseId === caseId)).toBe(true);
  });

  it('should filter by batch/search and exclude soft deleted files', async () => {
    const { caseId, batchId } = await createCaseAndBatch();
    const [batch2] = await dataSource.query<IdRow[]>(
      `
      INSERT INTO "file_batches" ("case_id", "title", "description", "uploaded_by_id")
      VALUES ($1, $2, $3, NULL)
      RETURNING "id"
      `,
      [caseId, 'Batch 2', 'Segundo lote'],
    );

    const created = await repository.createMany([
      {
        caseId,
        batchId,
        originalName: 'demanda.pdf',
        storedName: 'demanda',
        mimeType: 'application/pdf',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'demanda',
        publicUrl: 'http://localhost/uploads/demanda',
        uploadedById: null,
      },
      {
        caseId,
        batchId,
        originalName: 'anexo.pdf',
        storedName: 'anexo',
        mimeType: 'application/pdf',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'anexo',
        publicUrl: 'http://localhost/uploads/anexo',
        uploadedById: null,
      },
      {
        caseId,
        batchId: batch2.id,
        originalName: 'contract.docx',
        storedName: 'contract',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'contract',
        publicUrl: 'http://localhost/uploads/contract',
        uploadedById: null,
      },
    ]);

    await repository.softDelete(created[0].id);

    const byBatch = await repository.listByCaseId({
      caseId,
      page: 1,
      limit: 10,
      batchId,
    });
    const bySearch = await repository.listByCaseId({
      caseId,
      page: 1,
      limit: 10,
      search: 'contract',
    });

    expect(byBatch.total).toBe(1);
    expect(byBatch.data[0].originalName).toBe('anexo.pdf');
    expect(bySearch.total).toBe(1);
    expect(bySearch.data[0].originalName).toBe('contract.docx');
  });
});
