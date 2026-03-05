import { Inject, Injectable } from '@nestjs/common';
import { CASE_REPOSITORY } from '../../../../shared/di/tokens';
import { NotFoundApplicationError } from '../../../../shared/application/errors/application.error';
import { CaseRepositoryPort } from '../ports/case-repository.port';
import { Case } from '../../domain/entities/case';

@Injectable()
export class GetCaseByIdUseCase {
  constructor(
    @Inject(CASE_REPOSITORY)
    private readonly caseRepository: CaseRepositoryPort,
  ) {}

  async execute(caseId: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findById(caseId);
    if (!caseEntity) {
      throw new NotFoundApplicationError(`Case '${caseId}' was not found.`);
    }

    return caseEntity;
  }
}
