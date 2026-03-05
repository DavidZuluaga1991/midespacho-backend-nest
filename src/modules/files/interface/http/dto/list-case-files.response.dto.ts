import { ApiProperty } from '@nestjs/swagger';
import { CaseFileResponseDto } from './case-file.response.dto';

class PaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  hasNext!: boolean;
}

export class ListCaseFilesResponseDto {
  @ApiProperty({ type: [CaseFileResponseDto] })
  data!: CaseFileResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

