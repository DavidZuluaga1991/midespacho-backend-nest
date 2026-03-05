import { Inject, Injectable } from '@nestjs/common';
import {
  CASE_REPOSITORY,
  CLIENT_REPOSITORY,
  USER_REPOSITORY,
} from '../../../../shared/di/tokens';
import {
  ConflictApplicationError,
  NotFoundApplicationError,
} from '../../../../shared/application/errors/application.error';
import { CaseRepositoryPort } from '../ports/case-repository.port';
import { ClientRepositoryPort } from '../../../clients/application/ports/client-repository.port';
import { UserRepositoryPort } from '../../../users/application/ports/user-repository.port';
import { Case } from '../../domain/entities/case';
import { CaseStatus } from '../../domain/enums/case-status.enum';

export interface UpdateCaseInput {
  caseId: string;
  code?: string;
  title?: string;
  description?: string | null;
  status?: CaseStatus;
  openedAt?: Date;
  closedAt?: Date | null;
  clientId?: string;
  createdById?: string | null;
}

@Injectable()
export class UpdateCaseUseCase {
  constructor(
    @Inject(CASE_REPOSITORY)
    private readonly caseRepository: CaseRepositoryPort,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: UpdateCaseInput): Promise<Case> {
    const currentCase = await this.caseRepository.findById(input.caseId);
    if (!currentCase) {
      throw new NotFoundApplicationError(`Case '${input.caseId}' was not found.`);
    }

    if (input.code && input.code !== currentCase.code) {
      const codeInUse = await this.caseRepository.existsByCode(input.code);
      if (codeInUse) {
        throw new ConflictApplicationError(
          `Case code '${input.code}' already exists.`,
        );
      }
    }

    const nextClientId = input.clientId ?? currentCase.clientId;
    if (nextClientId !== currentCase.clientId) {
      const clientExists = await this.clientRepository.existsById(nextClientId);
      if (!clientExists) {
        throw new NotFoundApplicationError(`Client '${nextClientId}' was not found.`);
      }
    }

    if (input.createdById !== undefined && input.createdById !== null) {
      const userExists = await this.userRepository.existsById(input.createdById);
      if (!userExists) {
        throw new NotFoundApplicationError(
          `User '${input.createdById}' was not found.`,
        );
      }
    }

    const updated = await this.caseRepository.update(input.caseId, {
      code: input.code ?? currentCase.code,
      title: input.title ?? currentCase.title,
      description:
        input.description !== undefined
          ? input.description
          : currentCase.description,
      status: input.status ?? currentCase.status,
      openedAt: input.openedAt ?? currentCase.openedAt,
      closedAt:
        input.closedAt !== undefined ? input.closedAt : currentCase.closedAt,
      clientId: nextClientId,
      createdById:
        input.createdById !== undefined
          ? input.createdById
          : currentCase.createdById,
    });

    if (!updated) {
      throw new NotFoundApplicationError(`Case '${input.caseId}' was not found.`);
    }

    return updated;
  }
}
