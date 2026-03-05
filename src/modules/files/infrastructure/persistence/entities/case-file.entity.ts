import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CaseEntity } from '../../../../cases/infrastructure/persistence/entities/case.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/entities/user.entity';
import { FileBatchEntity } from './file-batch.entity';

@Entity({ name: 'case_files' })
@Index('IDX_case_files_case_id', ['caseId'])
@Index('IDX_case_files_batch_id', ['batchId'])
@Index('IDX_case_files_case_id_created_at', ['caseId', 'createdAt'])
export class CaseFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ name: 'stored_name', type: 'varchar', length: 255 })
  storedName!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120 })
  mimeType!: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes!: string;

  @Column({ name: 'storage_provider', type: 'varchar', length: 50 })
  storageProvider!: string;

  @Column({ name: 'storage_key', type: 'varchar', length: 255 })
  storageKey!: string;

  @Column({ name: 'public_url', type: 'text' })
  publicUrl!: string;

  @Column({ name: 'uploaded_by_id', type: 'uuid', nullable: true })
  uploadedById!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => CaseEntity, (caseEntity) => caseEntity.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'case_id' })
  case!: CaseEntity;

  @ManyToOne(() => FileBatchEntity, (batchEntity) => batchEntity.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch!: FileBatchEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.uploadedFiles, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy!: UserEntity | null;
}
