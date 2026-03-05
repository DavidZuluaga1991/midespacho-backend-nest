import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './database/typeorm.config';
import { CASE_FILE_REPOSITORY, CASE_REPOSITORY, CLIENT_REPOSITORY, FILE_BATCH_REPOSITORY, STORAGE_PORT, TRANSACTION_MANAGER, USER_REPOSITORY } from './shared/di/tokens';
import { TypeOrmCaseRepository } from './modules/cases/infrastructure/repositories/typeorm-case.repository';
import { TypeOrmClientRepository } from './modules/clients/infrastructure/repositories/typeorm-client.repository';
import { TypeOrmUserRepository } from './modules/users/infrastructure/repositories/typeorm-user.repository';
import { TypeOrmFileBatchRepository } from './modules/files/infrastructure/repositories/typeorm-file-batch.repository';
import { TypeOrmCaseFileRepository } from './modules/files/infrastructure/repositories/typeorm-case-file.repository';
import { LocalStorageStubAdapter } from './modules/files/infrastructure/storage/local-storage.stub';
import { TypeOrmTransactionManagerAdapter } from './shared/infrastructure/typeorm/typeorm-transaction-manager.adapter';
import { CreateCaseUseCase } from './modules/cases/application/use-cases/create-case.use-case';
import { UploadCaseFilesUseCase } from './modules/files/application/use-cases/upload-case-files.use-case';
import { ListCaseFilesUseCase } from './modules/files/application/use-cases/list-case-files.use-case';
import { DeleteCaseFileUseCase } from './modules/files/application/use-cases/delete-case-file.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '.env.development'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CreateCaseUseCase,
    UploadCaseFilesUseCase,
    ListCaseFilesUseCase,
    DeleteCaseFileUseCase,
    {
      provide: CASE_REPOSITORY,
      useClass: TypeOrmCaseRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: TypeOrmClientRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: FILE_BATCH_REPOSITORY,
      useClass: TypeOrmFileBatchRepository,
    },
    {
      provide: CASE_FILE_REPOSITORY,
      useClass: TypeOrmCaseFileRepository,
    },
    {
      provide: STORAGE_PORT,
      useClass: LocalStorageStubAdapter,
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: TypeOrmTransactionManagerAdapter,
    },
  ],
})
export class AppModule {}
