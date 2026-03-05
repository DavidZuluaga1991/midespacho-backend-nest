import { Inject, Injectable } from '@nestjs/common';
import {
  CASE_REPOSITORY,
  CASE_FILE_REPOSITORY,
} from '../../../../shared/di/tokens';
import { NotFoundApplicationError } from '../../../../shared/application/errors/application.error';
import { CaseRepositoryPort } from '../../../cases/application/ports/case-repository.port';
import { CaseFileRepositoryPort } from '../ports/case-file-repository.port';
import { CaseFile } from '../../domain/entities/case-file';

export interface ListCaseFilesInput {
  caseId: string;
  page?: number;
  limit?: number;
  batchId?: string;
  search?: string;
}

export interface ListCaseFilesOutput {
  data: CaseFile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

@Injectable()
export class ListCaseFilesUseCase {
  constructor(
    @Inject(CASE_REPOSITORY)
    private readonly caseRepository: CaseRepositoryPort,
    @Inject(CASE_FILE_REPOSITORY)
    private readonly caseFileRepository: CaseFileRepositoryPort,
  ) {}

  async execute(input: ListCaseFilesInput): Promise<ListCaseFilesOutput> {
    const caseEntity = await this.caseRepository.findById(input.caseId);
    if (!caseEntity) {
      throw new NotFoundApplicationError(
        `Case '${input.caseId}' was not found.`,
      );
    }

    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 20));
    const result = await this.caseFileRepository.listByCaseId({
      caseId: input.caseId,
      page,
      limit,
      batchId: input.batchId,
      search: input.search,
    });

    return {
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        hasNext: page * limit < result.total,
      },
    };
  }
}
