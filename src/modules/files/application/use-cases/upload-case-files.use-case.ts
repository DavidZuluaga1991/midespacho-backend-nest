import { Inject, Injectable } from '@nestjs/common';
import { CASE_REPOSITORY, CASE_FILE_REPOSITORY, FILE_BATCH_REPOSITORY, STORAGE_PORT, TRANSACTION_MANAGER, USER_REPOSITORY } from '../../../../shared/di/tokens';
import { NotFoundApplicationError, ValidationApplicationError } from '../../../../shared/application/errors/application.error';
import { TransactionManagerPort } from '../../../../shared/application/ports/transaction-manager.port';
import { CaseStatus } from '../../../cases/domain/enums/case-status.enum';
import { CaseRepositoryPort } from '../../../cases/application/ports/case-repository.port';
import { UserRepositoryPort } from '../../../users/application/ports/user-repository.port';
import { CaseFileRepositoryPort } from '../ports/case-file-repository.port';
import { FileBatchRepositoryPort } from '../ports/file-batch-repository.port';
import { StoragePort, UploadFileResult } from '../ports/storage.port';
import { FileBatch } from '../../domain/entities/file-batch';
import { CaseFile } from '../../domain/entities/case-file';

export interface UploadCaseFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadCaseFilesInput {
  caseId: string;
  batchTitle: string;
  batchDescription: string;
  files: UploadCaseFileInput[];
  uploadedById?: string | null;
}

export interface UploadCaseFilesResult {
  batch: FileBatch;
  files: CaseFile[];
}

@Injectable()
export class UploadCaseFilesUseCase {
  constructor(
    @Inject(CASE_REPOSITORY) private readonly caseRepository: CaseRepositoryPort,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(FILE_BATCH_REPOSITORY) private readonly fileBatchRepository: FileBatchRepositoryPort,
    @Inject(CASE_FILE_REPOSITORY) private readonly caseFileRepository: CaseFileRepositoryPort,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
    @Inject(TRANSACTION_MANAGER) private readonly transactionManager: TransactionManagerPort,
  ) {}

  async execute(input: UploadCaseFilesInput): Promise<UploadCaseFilesResult> {
    this.validateInput(input);

    const caseEntity = await this.caseRepository.findById(input.caseId);
    if (!caseEntity) {
      throw new NotFoundApplicationError(`Case '${input.caseId}' was not found.`);
    }

    if (caseEntity.status === CaseStatus.CLOSED) {
      throw new ValidationApplicationError(`Case '${input.caseId}' is closed and does not allow file uploads.`);
    }

    if (input.uploadedById) {
      const userExists = await this.userRepository.existsById(input.uploadedById);
      if (!userExists) {
        throw new NotFoundApplicationError(`User '${input.uploadedById}' was not found.`);
      }
    }

    const uploadedFiles: UploadFileResult[] = [];
    try {
      for (const file of input.files) {
        const uploaded = await this.storagePort.upload({
          buffer: file.buffer,
          originalName: file.originalName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
        });
        uploadedFiles.push(uploaded);
      }

      return this.transactionManager.runInTransaction(async (context) => {
        const batch = await this.fileBatchRepository.create(
          {
            caseId: input.caseId,
            title: input.batchTitle.trim(),
            description: input.batchDescription.trim(),
            uploadedById: input.uploadedById ?? null,
          },
          context,
        );

        const files = await this.caseFileRepository.createMany(
          uploadedFiles.map((uploaded, index) => {
            const originalFile = input.files[index];
            return {
              caseId: input.caseId,
              batchId: batch.id,
              originalName: originalFile.originalName,
              storedName: uploaded.storedName,
              mimeType: originalFile.mimeType,
              sizeBytes: String(originalFile.sizeBytes),
              storageProvider: uploaded.storageProvider,
              storageKey: uploaded.storageKey,
              publicUrl: uploaded.publicUrl,
              uploadedById: input.uploadedById ?? null,
            };
          }),
          context,
        );

        return { batch, files };
      });
    } catch (error) {
      await Promise.allSettled(uploadedFiles.map((file) => this.storagePort.delete(file.storageKey)));
      throw error;
    }
  }

  private validateInput(input: UploadCaseFilesInput): void {
    const title = input.batchTitle.trim();
    const description = input.batchDescription.trim();

    if (!title || title.length < 3 || title.length > 120) {
      throw new ValidationApplicationError('batchTitle must contain between 3 and 120 characters.');
    }

    if (!description || description.length < 10 || description.length > 1000) {
      throw new ValidationApplicationError('batchDescription must contain between 10 and 1000 characters.');
    }

    if (!input.files?.length) {
      throw new ValidationApplicationError('At least one file is required.');
    }
  }
}
