import { ApiProperty } from '@nestjs/swagger';
import { FileBatch } from '../../../domain/entities/file-batch';

export class FileBatchResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  caseId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true })
  uploadedById!: string | null;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(batch: FileBatch): FileBatchResponseDto {
    return {
      id: batch.id,
      caseId: batch.caseId,
      title: batch.title,
      description: batch.description,
      uploadedById: batch.uploadedById,
      createdAt: batch.createdAt,
    };
  }
}
