import { ClientEntity } from '../modules/clients/infrastructure/persistence/entities/client.entity';
import { CaseEntity } from '../modules/cases/infrastructure/persistence/entities/case.entity';
import { FileBatchEntity } from '../modules/files/infrastructure/persistence/entities/file-batch.entity';
import { CaseFileEntity } from '../modules/files/infrastructure/persistence/entities/case-file.entity';
import { UserEntity } from '../modules/users/infrastructure/persistence/entities/user.entity';

export const TYPEORM_ENTITIES = [UserEntity, ClientEntity, CaseEntity, FileBatchEntity, CaseFileEntity];

