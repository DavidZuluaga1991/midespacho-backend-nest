export interface CaseFile {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
