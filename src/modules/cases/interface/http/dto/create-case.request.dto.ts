import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { CaseStatus } from '../../../domain/enums/case-status.enum';

export class CreateCaseRequestDto {
  @ApiProperty({ example: 'EXP-2026-0001' })
  @IsString()
  @Length(3, 40)
  code!: string;

  @ApiProperty({ example: 'Proceso laboral - Juan Perez' })
  @IsString()
  @Length(3, 150)
  title!: string;

  @ApiPropertyOptional({ example: 'Documentos iniciales del expediente.' })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @ApiPropertyOptional({ enum: CaseStatus, example: CaseStatus.OPEN })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({ example: '2026-03-05T05:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @ApiPropertyOptional({ example: '2026-08-10T05:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  closedAt?: string;

  @ApiProperty({ example: '90c31c4e-7773-4428-9639-c8e3842f3564' })
  @IsUUID()
  clientId!: string;

  @ApiPropertyOptional({ example: '3f56b007-242e-4aab-a84d-19a9f7e7abde' })
  @IsOptional()
  @IsUUID()
  createdById?: string;
}
