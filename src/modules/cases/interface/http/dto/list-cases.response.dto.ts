import { ApiProperty } from '@nestjs/swagger';
import { CaseResponseDto } from './case.response.dto';

export class ListCasesMetaResponseDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  hasNext!: boolean;
}

export class ListCasesResponseDto {
  @ApiProperty({ type: [CaseResponseDto] })
  data!: CaseResponseDto[];

  @ApiProperty({ type: ListCasesMetaResponseDto })
  meta!: ListCasesMetaResponseDto;
}
