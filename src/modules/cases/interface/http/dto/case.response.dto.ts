import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from '../../../domain/enums/case-status.enum';
import { Case } from '../../../domain/entities/case';

export class CaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: CaseStatus })
  status!: CaseStatus;

  @ApiProperty()
  openedAt!: Date;

  @ApiProperty({ nullable: true })
  closedAt!: Date | null;

  @ApiProperty()
  clientId!: string;

  @ApiProperty({ nullable: true })
  createdById!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(caseEntity: Case): CaseResponseDto {
    return {
      id: caseEntity.id,
      code: caseEntity.code,
      title: caseEntity.title,
      description: caseEntity.description,
      status: caseEntity.status,
      openedAt: caseEntity.openedAt,
      closedAt: caseEntity.closedAt,
      clientId: caseEntity.clientId,
      createdById: caseEntity.createdById,
      createdAt: caseEntity.createdAt,
      updatedAt: caseEntity.updatedAt,
    };
  }
}
