import { Case } from '../../domain/entities/case';
import { CaseStatus } from '../../domain/enums/case-status.enum';

export interface CreateCaseRepositoryInput {
  code: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  openedAt: Date;
  closedAt: Date | null;
  clientId: string;
  createdById: string | null;
}

export interface UpdateCaseRepositoryInput {
  code: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  openedAt: Date;
  closedAt: Date | null;
  clientId: string;
  createdById: string | null;
}

export interface ListCasesRepositoryParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ListCasesRepositoryResult {
  data: Case[];
  total: number;
}

export interface CaseRepositoryPort {
  create(input: CreateCaseRepositoryInput): Promise<Case>;
  update(caseId: string, input: UpdateCaseRepositoryInput): Promise<Case | null>;
  deleteById(caseId: string): Promise<void>;
  existsByCode(code: string): Promise<boolean>;
  findById(caseId: string): Promise<Case | null>;
  list(params: ListCasesRepositoryParams): Promise<ListCasesRepositoryResult>;
}
