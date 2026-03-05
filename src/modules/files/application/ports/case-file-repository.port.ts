import { CaseFile } from '../../domain/entities/case-file';
import { TransactionContext } from '../../../../shared/application/ports/transaction-manager.port';

export interface CreateCaseFileRepositoryInput {
  caseId: string;
  batchId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: string;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
  uploadedById: string | null;
}

export interface ListCaseFilesQuery {
  caseId: string;
  page: number;
  limit: number;
  batchId?: string;
  search?: string;
}

export interface ListCaseFilesResult {
  data: CaseFile[];
  total: number;
}

export interface CaseFileRepositoryPort {
  createMany(inputs: CreateCaseFileRepositoryInput[], context?: TransactionContext): Promise<CaseFile[]>;
  listByCaseId(query: ListCaseFilesQuery): Promise<ListCaseFilesResult>;
  findById(fileId: string): Promise<CaseFile | null>;
  softDelete(fileId: string, context?: TransactionContext): Promise<void>;
}

