import { ApiProperty } from '@nestjs/swagger';
import { FileBatchResponseDto } from './file-batch.response.dto';
import { CaseFileResponseDto } from './case-file.response.dto';

export class UploadCaseFilesResponseDto {
  @ApiProperty({ type: FileBatchResponseDto })
  batch!: FileBatchResponseDto;

  @ApiProperty({ type: [CaseFileResponseDto] })
  files!: CaseFileResponseDto[];
}
