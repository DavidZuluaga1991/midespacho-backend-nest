import { Inject, Injectable } from '@nestjs/common';
import { CASE_REPOSITORY } from '../../../../shared/di/tokens';
import { NotFoundApplicationError } from '../../../../shared/application/errors/application.error';
import { CaseRepositoryPort } from '../ports/case-repository.port';

@Injectable()
export class DeleteCaseUseCase {
  constructor(
    @Inject(CASE_REPOSITORY)
    private readonly caseRepository: CaseRepositoryPort,
  ) {}

  async execute(caseId: string): Promise<void> {
    const currentCase = await this.caseRepository.findById(caseId);
    if (!currentCase) {
      throw new NotFoundApplicationError(`Case '${caseId}' was not found.`);
    }

    await this.caseRepository.deleteById(caseId);
  }
}
