import { FileBatch } from '../../domain/entities/file-batch';
import { TransactionContext } from '../../../../shared/application/ports/transaction-manager.port';

export interface CreateFileBatchRepositoryInput {
  caseId: string;
  title: string;
  description: string;
  uploadedById: string | null;
}

export interface FileBatchRepositoryPort {
  create(
    input: CreateFileBatchRepositoryInput,
    context?: TransactionContext,
  ): Promise<FileBatch>;
}
