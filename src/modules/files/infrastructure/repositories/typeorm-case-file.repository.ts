import { Injectable } from '@nestjs/common';
import { DataSource, ILike, IsNull } from 'typeorm';
import {
  CaseFileRepositoryPort,
  CreateCaseFileRepositoryInput,
  ListCaseFilesQuery,
  ListCaseFilesResult,
} from '../../application/ports/case-file-repository.port';
import { CaseFile } from '../../domain/entities/case-file';
import { CaseFileEntity } from '../persistence/entities/case-file.entity';
import { TransactionContext } from '../../../../shared/application/ports/transaction-manager.port';
import { resolveManager } from '../../../../shared/infrastructure/typeorm/typeorm-manager.util';

const toDomain = (entity: CaseFileEntity): CaseFile => ({
  id: entity.id,
  caseId: entity.caseId,
  batchId: entity.batchId,
  originalName: entity.originalName,
  storedName: entity.storedName,
  mimeType: entity.mimeType,
  sizeBytes: entity.sizeBytes,
  storageProvider: entity.storageProvider,
  storageKey: entity.storageKey,
  publicUrl: entity.publicUrl,
  uploadedById: entity.uploadedById,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
  deletedAt: entity.deletedAt,
});

@Injectable()
export class TypeOrmCaseFileRepository implements CaseFileRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async createMany(
    inputs: CreateCaseFileRepositoryInput[],
    context?: TransactionContext,
  ): Promise<CaseFile[]> {
    const manager = resolveManager(this.dataSource, context);
    const repository = manager.getRepository(CaseFileEntity);
    const entities = repository.create(
      inputs.map((input) => ({
        caseId: input.caseId,
        batchId: input.batchId,
        originalName: input.originalName,
        storedName: input.storedName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storageProvider: input.storageProvider,
        storageKey: input.storageKey,
        publicUrl: input.publicUrl,
        uploadedById: input.uploadedById,
      })),
    );

    const created = await repository.save(entities);
    return created.map(toDomain);
  }

  async listByCaseId(query: ListCaseFilesQuery): Promise<ListCaseFilesResult> {
    const repository = this.dataSource.getRepository(CaseFileEntity);
    const where = {
      caseId: query.caseId,
      deletedAt: IsNull(),
      ...(query.batchId ? { batchId: query.batchId } : {}),
      ...(query.search ? { originalName: ILike(`%${query.search}%`) } : {}),
    };

    const [data, total] = await repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      data: data.map(toDomain),
      total,
    };
  }

  async findById(fileId: string): Promise<CaseFile | null> {
    const entity = await this.dataSource.getRepository(CaseFileEntity).findOne({
      where: { id: fileId, deletedAt: IsNull() },
    });
    return entity ? toDomain(entity) : null;
  }

  async softDelete(
    fileId: string,
    context?: TransactionContext,
  ): Promise<void> {
    const manager = resolveManager(this.dataSource, context);
    await manager.getRepository(CaseFileEntity).softDelete(fileId);
  }
}
