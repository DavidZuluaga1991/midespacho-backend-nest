import { Inject, Injectable } from '@nestjs/common';
import { CASE_REPOSITORY } from '../../../../shared/di/tokens';
import { CaseRepositoryPort } from '../ports/case-repository.port';
import { Case } from '../../domain/entities/case';

export interface ListCasesInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListCasesResult {
  data: Case[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

@Injectable()
export class ListCasesUseCase {
  constructor(
    @Inject(CASE_REPOSITORY)
    private readonly caseRepository: CaseRepositoryPort,
  ) {}

  async execute(input: ListCasesInput): Promise<ListCasesResult> {
    const page = Math.max(1, Math.trunc(input.page ?? 1));
    const limit = Math.min(50, Math.max(1, Math.trunc(input.limit ?? 20)));
    const search = input.search?.trim() || undefined;

    const result = await this.caseRepository.list({ page, limit, search });
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
