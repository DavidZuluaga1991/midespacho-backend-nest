import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from './entities';
import { resolvePostgresConnectionConfig } from './postgres-config.util';

const postgresConfig = resolvePostgresConnectionConfig(
  (key) => process.env[key],
);

const AppDataSource = new DataSource({
  type: 'postgres',
  ...postgresConfig,
  entities: TYPEORM_ENTITIES,
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
