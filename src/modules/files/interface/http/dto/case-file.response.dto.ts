import { ApiProperty } from '@nestjs/swagger';
import { CaseFile } from '../../../domain/entities/case-file';

export class CaseFileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  caseId!: string;

  @ApiProperty()
  batchId!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty()
  storedName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: string;

  @ApiProperty()
  storageProvider!: string;

  @ApiProperty()
  storageKey!: string;

  @ApiProperty()
  publicUrl!: string;

  @ApiProperty({ nullable: true })
  uploadedById!: string | null;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(file: CaseFile): CaseFileResponseDto {
    return {
      id: file.id,
      caseId: file.caseId,
      batchId: file.batchId,
      originalName: file.originalName,
      storedName: file.storedName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      storageProvider: file.storageProvider,
      storageKey: file.storageKey,
      publicUrl: file.publicUrl,
      uploadedById: file.uploadedById,
      createdAt: file.createdAt,
    };
  }
}
