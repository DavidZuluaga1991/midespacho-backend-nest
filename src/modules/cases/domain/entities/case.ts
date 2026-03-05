import { CaseStatus } from '../enums/case-status.enum';

export interface Case {
  id: string;
  code: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  openedAt: Date;
  closedAt: Date | null;
  clientId: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}
