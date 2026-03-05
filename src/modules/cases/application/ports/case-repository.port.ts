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

export interface CaseRepositoryPort {
  create(input: CreateCaseRepositoryInput): Promise<Case>;
  existsByCode(code: string): Promise<boolean>;
  findById(caseId: string): Promise<Case | null>;
}
