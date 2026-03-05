import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import {
  StoragePort,
  UploadFileInput,
  UploadFileResult,
} from '../../application/ports/storage.port';

const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export class LocalStorageAdapter implements StoragePort {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = resolve(
      process.cwd(),
      this.configService.get<string>('LOCAL_UPLOADS_DIR', 'uploads'),
    );

    const routePrefix = this.configService.get<string>(
      'LOCAL_UPLOADS_ROUTE_PREFIX',
      'uploads',
    );
    this.baseUrl =
      this.configService.get<string>('LOCAL_UPLOADS_BASE_URL') ??
      `http://localhost:${this.configService.get<string>('PORT', '3000')}/${routePrefix}`;
  }

  async upload(file: UploadFileInput): Promise<UploadFileResult> {
    await mkdir(this.uploadsDir, { recursive: true });

    const safeOriginalName = sanitizeFileName(file.originalName);
    const storedName = `${randomUUID()}-${safeOriginalName}`;
    const destinationPath = join(this.uploadsDir, storedName);

    await writeFile(destinationPath, file.buffer);

    return {
      storedName,
      storageProvider: 'local',
      storageKey: storedName,
      publicUrl: `${this.baseUrl}/${storedName}`,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const destinationPath = join(this.uploadsDir, storageKey);
    try {
      await unlink(destinationPath);
    } catch {
      // File might already be gone. Deleting should be idempotent.
    }
  }
}
