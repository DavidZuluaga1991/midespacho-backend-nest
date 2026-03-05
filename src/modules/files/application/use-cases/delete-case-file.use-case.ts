import { Inject, Injectable } from '@nestjs/common';
import { CASE_FILE_REPOSITORY, STORAGE_PORT, TRANSACTION_MANAGER } from '../../../../shared/di/tokens';
import { NotFoundApplicationError } from '../../../../shared/application/errors/application.error';
import { TransactionManagerPort } from '../../../../shared/application/ports/transaction-manager.port';
import { CaseFileRepositoryPort } from '../ports/case-file-repository.port';
import { StoragePort } from '../ports/storage.port';

export interface DeleteCaseFileInput {
  fileId: string;
}

@Injectable()
export class DeleteCaseFileUseCase {
  constructor(
    @Inject(CASE_FILE_REPOSITORY) private readonly caseFileRepository: CaseFileRepositoryPort,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
    @Inject(TRANSACTION_MANAGER) private readonly transactionManager: TransactionManagerPort,
  ) {}

  async execute(input: DeleteCaseFileInput): Promise<void> {
    const file = await this.caseFileRepository.findById(input.fileId);
    if (!file) {
      throw new NotFoundApplicationError(`File '${input.fileId}' was not found.`);
    }

    await this.transactionManager.runInTransaction(async (context) => {
      await this.caseFileRepository.softDelete(input.fileId, context);
    });

    await this.storagePort.delete(file.storageKey);
  }
}

