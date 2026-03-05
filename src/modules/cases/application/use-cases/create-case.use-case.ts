import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, USER_REPOSITORY, CASE_REPOSITORY } from '../../../../shared/di/tokens';
import { ConflictApplicationError, NotFoundApplicationError } from '../../../../shared/application/errors/application.error';
import { ClientRepositoryPort } from '../../../clients/application/ports/client-repository.port';
import { UserRepositoryPort } from '../../../users/application/ports/user-repository.port';
import { CaseRepositoryPort } from '../ports/case-repository.port';
import { Case } from '../../domain/entities/case';
import { CaseStatus } from '../../domain/enums/case-status.enum';

export interface CreateCaseInput {
  code: string;
  title: string;
  description?: string | null;
  status?: CaseStatus;
  openedAt?: Date;
  closedAt?: Date | null;
  clientId: string;
  createdById?: string | null;
}

@Injectable()
export class CreateCaseUseCase {
  constructor(
    @Inject(CASE_REPOSITORY) private readonly caseRepository: CaseRepositoryPort,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepositoryPort,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: CreateCaseInput): Promise<Case> {
    const [codeInUse, clientExists] = await Promise.all([
      this.caseRepository.existsByCode(input.code),
      this.clientRepository.existsById(input.clientId),
    ]);

    if (codeInUse) {
      throw new ConflictApplicationError(`Case code '${input.code}' already exists.`);
    }

    if (!clientExists) {
      throw new NotFoundApplicationError(`Client '${input.clientId}' was not found.`);
    }

    if (input.createdById) {
      const userExists = await this.userRepository.existsById(input.createdById);
      if (!userExists) {
        throw new NotFoundApplicationError(`User '${input.createdById}' was not found.`);
      }
    }

    return this.caseRepository.create({
      code: input.code,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? CaseStatus.OPEN,
      openedAt: input.openedAt ?? new Date(),
      closedAt: input.closedAt ?? null,
      clientId: input.clientId,
      createdById: input.createdById ?? null,
    });
  }
}

