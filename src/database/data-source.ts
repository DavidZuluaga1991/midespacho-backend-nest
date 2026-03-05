import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from './entities';

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const ssl = toBoolean(process.env.DATABASE_SSL, false);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME ?? 'midespacho',
  password: process.env.DATABASE_PASSWORD ?? 'midespacho',
  database: process.env.DATABASE_NAME ?? 'midespacho',
  entities: TYPEORM_ENTITIES,
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  ssl: ssl ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
