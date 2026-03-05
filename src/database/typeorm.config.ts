import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_ENTITIES } from './entities';

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const ssl = toBoolean(configService.get<string>('DATABASE_SSL'), false);

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USERNAME', 'midespacho'),
    password: configService.get<string>('DATABASE_PASSWORD', 'midespacho'),
    database: configService.get<string>('DATABASE_NAME', 'midespacho'),
    entities: TYPEORM_ENTITIES,
    synchronize: false,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    logging: false,
  };
};

