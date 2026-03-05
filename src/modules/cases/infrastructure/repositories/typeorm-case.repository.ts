import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CaseRepositoryPort,
  CreateCaseRepositoryInput,
  ListCasesRepositoryParams,
  ListCasesRepositoryResult,
} from '../../application/ports/case-repository.port';
import { Case } from '../../domain/entities/case';
import { CaseEntity } from '../persistence/entities/case.entity';

const toDomain = (entity: CaseEntity): Case => ({
  id: entity.id,
  code: entity.code,
  title: entity.title,
  description: entity.description,
  status: entity.status,
  openedAt: entity.openedAt,
  closedAt: entity.closedAt,
  clientId: entity.clientId,
  createdById: entity.createdById,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

@Injectable()
export class TypeOrmCaseRepository implements CaseRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async create(input: CreateCaseRepositoryInput): Promise<Case> {
    const repository = this.dataSource.getRepository(CaseEntity);
    const entity = repository.create({
      code: input.code,
      title: input.title,
      description: input.description,
      status: input.status,
      openedAt: input.openedAt,
      closedAt: input.closedAt,
      clientId: input.clientId,
      createdById: input.createdById,
    });

    const created = await repository.save(entity);
    return toDomain(created);
  }

  existsByCode(code: string): Promise<boolean> {
    return this.dataSource
      .getRepository(CaseEntity)
      .exists({ where: { code } });
  }

  async findById(caseId: string): Promise<Case | null> {
    const entity = await this.dataSource
      .getRepository(CaseEntity)
      .findOne({ where: { id: caseId } });
    return entity ? toDomain(entity) : null;
  }

  async list(
    params: ListCasesRepositoryParams,
  ): Promise<ListCasesRepositoryResult> {
    const repository = this.dataSource.getRepository(CaseEntity);
    const query = repository
      .createQueryBuilder('c')
      .orderBy('c.openedAt', 'DESC')
      .addOrderBy('c.createdAt', 'DESC')
      .skip((params.page - 1) * params.limit)
      .take(params.limit);

    if (params.search) {
      query.andWhere('(c.code ILIKE :search OR c.title ILIKE :search)', {
        search: `%${params.search}%`,
      });
    }

    const [rows, total] = await query.getManyAndCount();
    return {
      data: rows.map(toDomain),
      total,
    };
  }
}
