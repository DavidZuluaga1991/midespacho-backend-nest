export interface FileBatch {
  id: string;
  caseId: string;
  title: string;
  description: string;
  uploadedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

