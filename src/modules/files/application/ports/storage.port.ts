export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadFileResult {
  storedName: string;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
}

export interface StoragePort {
  upload(file: UploadFileInput): Promise<UploadFileResult>;
  delete(storageKey: string): Promise<void>;
}
