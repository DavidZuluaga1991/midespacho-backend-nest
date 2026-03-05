import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CaseEntity } from '../../../../cases/infrastructure/persistence/entities/case.entity';
import { FileBatchEntity } from '../../../../files/infrastructure/persistence/entities/file-batch.entity';
import { CaseFileEntity } from '../../../../files/infrastructure/persistence/entities/case-file.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

@Entity({ name: 'users' })
@Unique('UQ_users_email', ['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 160 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.ASSISTANT,
  })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => CaseEntity, (caseEntity) => caseEntity.createdBy)
  createdCases!: CaseEntity[];

  @OneToMany(() => FileBatchEntity, (batchEntity) => batchEntity.uploadedBy)
  uploadedBatches!: FileBatchEntity[];

  @OneToMany(() => CaseFileEntity, (fileEntity) => fileEntity.uploadedBy)
  uploadedFiles!: CaseFileEntity[];
}
