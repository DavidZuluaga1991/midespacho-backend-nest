import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { StoragePort, UploadFileInput, UploadFileResult } from '../../application/ports/storage.port';

export class CloudinaryStorageAdapter implements StoragePort {
  private readonly folder: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration is missing. Check CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.');
    }

    this.folder = this.configService.get<string>('CLOUDINARY_FOLDER', 'midespacho');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  upload(file: UploadFileInput): Promise<UploadFileResult> {
    const extension = extname(file.originalName);
    const publicId = `${randomUUID()}${extension}`;

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          resource_type: 'auto',
          public_id: publicId,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed.'));
            return;
          }

          resolve({
            storedName: result.public_id,
            storageProvider: 'cloudinary',
            storageKey: result.public_id,
            publicUrl: result.secure_url,
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  async delete(storageKey: string): Promise<void> {
    const resourceTypes: Array<'raw' | 'image' | 'video'> = ['raw', 'image', 'video'];

    for (const resourceType of resourceTypes) {
      const result = await cloudinary.uploader.destroy(storageKey, {
        resource_type: resourceType,
        invalidate: true,
      });

      if (result.result === 'ok' || result.result === 'not found') {
        break;
      }
    }
  }
}

