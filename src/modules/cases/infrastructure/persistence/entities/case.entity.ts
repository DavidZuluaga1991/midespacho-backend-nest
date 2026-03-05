import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ClientEntity } from '../../../../clients/infrastructure/persistence/entities/client.entity';
import { FileBatchEntity } from '../../../../files/infrastructure/persistence/entities/file-batch.entity';
import { CaseFileEntity } from '../../../../files/infrastructure/persistence/entities/case-file.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/entities/user.entity';
import { CaseStatus } from '../../../domain/enums/case-status.enum';

@Entity({ name: 'cases' })
@Unique('UQ_cases_code', ['code'])
@Index('IDX_cases_client_status', ['clientId', 'status'])
export class CaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 40 })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    enumName: 'case_status_enum',
    default: CaseStatus.OPEN,
  })
  status!: CaseStatus;

  @Column({ name: 'opened_at', type: 'timestamptz' })
  openedAt!: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => ClientEntity, (clientEntity) => clientEntity.cases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.createdCases, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: UserEntity | null;

  @OneToMany(() => FileBatchEntity, (batchEntity) => batchEntity.case)
  fileBatches!: FileBatchEntity[];

  @OneToMany(() => CaseFileEntity, (fileEntity) => fileEntity.case)
  files!: CaseFileEntity[];
}

