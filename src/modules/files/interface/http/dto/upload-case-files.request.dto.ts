import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UploadCaseFilesRequestDto {
  @ApiProperty({ example: 'Documentacion inicial' })
  @IsString()
  @Length(3, 120)
  batchTitle!: string;

  @ApiProperty({ example: 'Poder, cedula y demanda firmada.' })
  @IsString()
  @Length(10, 1000)
  batchDescription!: string;
}

