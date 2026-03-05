import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CaseEntity } from '../../../../cases/infrastructure/persistence/entities/case.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/entities/user.entity';
import { CaseFileEntity } from './case-file.entity';

@Entity({ name: 'file_batches' })
@Index('IDX_file_batches_case_id_created_at', ['caseId', 'createdAt'])
export class FileBatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'uploaded_by_id', type: 'uuid', nullable: true })
  uploadedById!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => CaseEntity, (caseEntity) => caseEntity.fileBatches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'case_id' })
  case!: CaseEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.uploadedBatches, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy!: UserEntity | null;

  @OneToMany(() => CaseFileEntity, (fileEntity) => fileEntity.batch)
  files!: CaseFileEntity[];
}
