import { CaseStatus } from '../../../cases/domain/enums/case-status.enum';
import { CaseRepositoryPort } from '../../../cases/application/ports/case-repository.port';
import { UserRepositoryPort } from '../../../users/application/ports/user-repository.port';
import { FileBatchRepositoryPort } from '../ports/file-batch-repository.port';
import { CaseFileRepositoryPort } from '../ports/case-file-repository.port';
import { StoragePort } from '../ports/storage.port';
import { UploadCaseFilesUseCase } from './upload-case-files.use-case';
import {
  TransactionContext,
  TransactionManagerPort,
} from '../../../../shared/application/ports/transaction-manager.port';
import { ValidationApplicationError } from '../../../../shared/application/errors/application.error';

describe('UploadCaseFilesUseCase', () => {
  let caseRepository: jest.Mocked<CaseRepositoryPort>;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let fileBatchRepository: jest.Mocked<FileBatchRepositoryPort>;
  let caseFileRepository: jest.Mocked<CaseFileRepositoryPort>;
  let storagePort: jest.Mocked<StoragePort>;
  let transactionManager: TransactionManagerPort;
  let runInTransactionMock: jest.MockedFunction<
    TransactionManagerPort['runInTransaction']
  >;
  let useCase: UploadCaseFilesUseCase;

  beforeEach(() => {
    caseRepository = {
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      existsByCode: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };
    userRepository = { existsById: jest.fn() };
    fileBatchRepository = { create: jest.fn() };
    caseFileRepository = {
      createMany: jest.fn(),
      listByCaseId: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
    };
    storagePort = { upload: jest.fn(), delete: jest.fn() };
    runInTransactionMock = jest.fn(
      <T>(operation: (context: TransactionContext) => Promise<T>): Promise<T> =>
        operation({ manager: {} as never }),
    ) as unknown as jest.MockedFunction<
      TransactionManagerPort['runInTransaction']
    >;
    transactionManager = {
      runInTransaction:
        runInTransactionMock as TransactionManagerPort['runInTransaction'],
    };

    useCase = new UploadCaseFilesUseCase(
      caseRepository,
      userRepository,
      fileBatchRepository,
      caseFileRepository,
      storagePort,
      transactionManager,
    );
  });

  it('should fail validation when batch title is too short', async () => {
    await expect(
      useCase.execute({
        caseId: 'case-1',
        batchTitle: 'ab',
        batchDescription: 'descripcion valida',
        files: [
          {
            buffer: Buffer.from('a'),
            originalName: 'doc.txt',
            mimeType: 'text/plain',
            sizeBytes: 1,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ValidationApplicationError);

    expect(caseRepository.findById.mock.calls).toHaveLength(0);
  });

  it('should fail when case is closed', async () => {
    caseRepository.findById.mockResolvedValue({
      id: 'case-1',
      code: 'EXP-1',
      title: 'Case',
      description: null,
      status: CaseStatus.CLOSED,
      openedAt: new Date(),
      closedAt: new Date(),
      clientId: 'client-1',
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        caseId: 'case-1',
        batchTitle: 'Lote inicial',
        batchDescription: 'descripcion valida para la prueba',
        files: [
          {
            buffer: Buffer.from('a'),
            originalName: 'doc.txt',
            mimeType: 'text/plain',
            sizeBytes: 1,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ValidationApplicationError);
  });

  it('should upload and persist metadata in a transaction', async () => {
    caseRepository.findById.mockResolvedValue({
      id: 'case-1',
      code: 'EXP-1',
      title: 'Case',
      description: null,
      status: CaseStatus.OPEN,
      openedAt: new Date(),
      closedAt: null,
      clientId: 'client-1',
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userRepository.existsById.mockResolvedValue(true);
    storagePort.upload
      .mockResolvedValueOnce({
        storedName: 'stored-1',
        storageProvider: 'local',
        storageKey: 'stored-1',
        publicUrl: 'http://localhost/uploads/stored-1',
      })
      .mockResolvedValueOnce({
        storedName: 'stored-2',
        storageProvider: 'local',
        storageKey: 'stored-2',
        publicUrl: 'http://localhost/uploads/stored-2',
      });
    fileBatchRepository.create.mockResolvedValue({
      id: 'batch-1',
      caseId: 'case-1',
      title: 'Lote inicial',
      description: 'descripcion valida para la prueba',
      uploadedById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    caseFileRepository.createMany.mockResolvedValue([
      {
        id: 'file-1',
        caseId: 'case-1',
        batchId: 'batch-1',
        originalName: 'a.txt',
        storedName: 'stored-1',
        mimeType: 'text/plain',
        sizeBytes: '10',
        storageProvider: 'local',
        storageKey: 'stored-1',
        publicUrl: 'http://localhost/uploads/stored-1',
        uploadedById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    const result = await useCase.execute({
      caseId: 'case-1',
      batchTitle: '  Lote inicial  ',
      batchDescription: 'descripcion valida para la prueba',
      uploadedById: 'user-1',
      files: [
        {
          buffer: Buffer.from('a'),
          originalName: 'a.txt',
          mimeType: 'text/plain',
          sizeBytes: 10,
        },
        {
          buffer: Buffer.from('b'),
          originalName: 'b.txt',
          mimeType: 'text/plain',
          sizeBytes: 20,
        },
      ],
    });

    expect(storagePort.upload.mock.calls).toHaveLength(2);
    expect(fileBatchRepository.create.mock.calls).toHaveLength(1);
    expect(fileBatchRepository.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ title: 'Lote inicial' }),
    );
    expect(fileBatchRepository.create.mock.calls[0]?.[1]).toEqual(
      expect.any(Object),
    );
    expect(caseFileRepository.createMany.mock.calls).toHaveLength(1);
    expect(result.batch.id).toBe('batch-1');
    expect(result.files).toHaveLength(1);
  });

  it('should cleanup uploaded files when persistence fails', async () => {
    caseRepository.findById.mockResolvedValue({
      id: 'case-1',
      code: 'EXP-1',
      title: 'Case',
      description: null,
      status: CaseStatus.OPEN,
      openedAt: new Date(),
      closedAt: null,
      clientId: 'client-1',
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    storagePort.upload.mockResolvedValue({
      storedName: 'stored-1',
      storageProvider: 'local',
      storageKey: 'stored-1',
      publicUrl: 'http://localhost/uploads/stored-1',
    });
    runInTransactionMock.mockRejectedValue(new Error('DB failed'));

    await expect(
      useCase.execute({
        caseId: 'case-1',
        batchTitle: 'Lote inicial',
        batchDescription: 'descripcion valida para la prueba',
        files: [
          {
            buffer: Buffer.from('a'),
            originalName: 'a.txt',
            mimeType: 'text/plain',
            sizeBytes: 10,
          },
        ],
      }),
    ).rejects.toThrow('DB failed');

    expect(storagePort.delete.mock.calls).toContainEqual(['stored-1']);
  });
});
