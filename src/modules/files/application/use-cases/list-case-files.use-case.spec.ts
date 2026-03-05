import { CaseRepositoryPort } from '../../../cases/application/ports/case-repository.port';
import { CaseStatus } from '../../../cases/domain/enums/case-status.enum';
import { NotFoundApplicationError } from '../../../../shared/application/errors/application.error';
import { CaseFileRepositoryPort } from '../ports/case-file-repository.port';
import { ListCaseFilesUseCase } from './list-case-files.use-case';

describe('ListCaseFilesUseCase', () => {
  let caseRepository: jest.Mocked<CaseRepositoryPort>;
  let caseFileRepository: jest.Mocked<CaseFileRepositoryPort>;
  let useCase: ListCaseFilesUseCase;

  beforeEach(() => {
    caseRepository = {
      create: jest.fn(),
      existsByCode: jest.fn(),
      findById: jest.fn(),
    };
    caseFileRepository = {
      createMany: jest.fn(),
      listByCaseId: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new ListCaseFilesUseCase(caseRepository, caseFileRepository);
  });

  it('should throw when case does not exist', async () => {
    caseRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ caseId: 'missing-case' }),
    ).rejects.toBeInstanceOf(NotFoundApplicationError);
    expect(caseFileRepository.listByCaseId.mock.calls).toHaveLength(0);
  });

  it('should clamp page/limit and return pagination metadata', async () => {
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
    caseFileRepository.listByCaseId.mockResolvedValue({
      data: [],
      total: 150,
    });

    const result = await useCase.execute({
      caseId: 'case-1',
      page: 0,
      limit: 500,
      search: 'demanda',
    });

    expect(caseFileRepository.listByCaseId.mock.calls).toHaveLength(1);
    expect(caseFileRepository.listByCaseId.mock.calls[0]?.[0]).toEqual({
      caseId: 'case-1',
      page: 1,
      limit: 100,
      batchId: undefined,
      search: 'demanda',
    });
    expect(result.meta).toEqual({
      page: 1,
      limit: 100,
      total: 150,
      hasNext: true,
    });
  });
});
