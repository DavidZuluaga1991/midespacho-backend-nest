import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_ENTITIES } from './entities';
import { resolvePostgresConnectionConfig } from './postgres-config.util';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const postgresConfig = resolvePostgresConnectionConfig((key) =>
    configService.get<string>(key),
  );

  return {
    type: 'postgres',
    ...postgresConfig,
    entities: TYPEORM_ENTITIES,
    synchronize: false,
    logging: false,
  };
};
