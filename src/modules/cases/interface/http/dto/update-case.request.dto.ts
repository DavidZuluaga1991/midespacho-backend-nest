import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { CaseStatus } from '../../../domain/enums/case-status.enum';

export class UpdateCaseRequestDto {
  @ApiPropertyOptional({ example: 'EXP-2026-0002' })
  @IsOptional()
  @IsString()
  @Length(3, 40)
  code?: string;

  @ApiPropertyOptional({ example: 'Proceso civil - Ana Gomez' })
  @IsOptional()
  @IsString()
  @Length(3, 150)
  title?: string;

  @ApiPropertyOptional({
    example: 'Actualizacion del contexto del expediente.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string | null;

  @ApiPropertyOptional({ enum: CaseStatus, example: CaseStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({ example: '2026-03-05T05:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @ApiPropertyOptional({ example: '2026-08-10T05:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  closedAt?: string | null;

  @ApiPropertyOptional({ example: '90c31c4e-7773-4428-9639-c8e3842f3564' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ example: '3f56b007-242e-4aab-a84d-19a9f7e7abde', nullable: true })
  @IsOptional()
  @IsUUID()
  createdById?: string | null;
}
