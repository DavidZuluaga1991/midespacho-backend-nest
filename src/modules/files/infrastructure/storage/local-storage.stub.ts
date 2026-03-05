import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StoragePort, UploadFileInput, UploadFileResult } from '../../application/ports/storage.port';

@Injectable()
export class LocalStorageStubAdapter implements StoragePort {
  async upload(file: UploadFileInput): Promise<UploadFileResult> {
    const fileId = randomUUID();
    const storedName = `${fileId}-${file.originalName}`;

    return {
      storedName,
      storageProvider: 'local-stub',
      storageKey: storedName,
      publicUrl: `local://uploads/${storedName}`,
    };
  }

  async delete(_storageKey: string): Promise<void> {}
}

