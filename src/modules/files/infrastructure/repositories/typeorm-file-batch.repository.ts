import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  FileBatchRepositoryPort,
  CreateFileBatchRepositoryInput,
} from '../../application/ports/file-batch-repository.port';
import { FileBatch } from '../../domain/entities/file-batch';
import { FileBatchEntity } from '../persistence/entities/file-batch.entity';
import { TransactionContext } from '../../../../shared/application/ports/transaction-manager.port';
import { resolveManager } from '../../../../shared/infrastructure/typeorm/typeorm-manager.util';

const toDomain = (entity: FileBatchEntity): FileBatch => ({
  id: entity.id,
  caseId: entity.caseId,
  title: entity.title,
  description: entity.description,
  uploadedById: entity.uploadedById,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

@Injectable()
export class TypeOrmFileBatchRepository implements FileBatchRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    input: CreateFileBatchRepositoryInput,
    context?: TransactionContext,
  ): Promise<FileBatch> {
    const manager = resolveManager(this.dataSource, context);
    const repository = manager.getRepository(FileBatchEntity);
    const entity = repository.create({
      caseId: input.caseId,
      title: input.title,
      description: input.description,
      uploadedById: input.uploadedById,
    });

    const created = await repository.save(entity);
    return toDomain(created);
  }
}
