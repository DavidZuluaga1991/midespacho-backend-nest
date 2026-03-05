import 'dotenv/config';
import AppDataSource from './data-source';
import { resolvePostgresConnectionConfig } from './postgres-config.util';

interface ConnectionProbeRow {
  database: string;
  user: string;
  server_time: string;
}

const describeTarget = (): string => {
  const config = resolvePostgresConnectionConfig((key) => process.env[key]);

  if (config.url) {
    try {
      const parsed = new URL(config.url);
      const dbName = parsed.pathname.replace(/^\/+/, '') || 'postgres';
      const port = parsed.port || '5432';
      return `${parsed.hostname}:${port}/${dbName} (via URL)`;
    } catch {
      return 'via URL (SUPABASE_URI / DATABASE_URL)';
    }
  }

  return `${config.host ?? 'localhost'}:${config.port ?? 5432}/${config.database ?? 'postgres'} (via host/port)`;
};

const checkConnection = async (): Promise<void> => {
  const target = describeTarget();
  console.log(`Validando conexion PostgreSQL -> ${target}`);

  await AppDataSource.initialize();
  const [row] = await AppDataSource.query<ConnectionProbeRow[]>(
    `
    SELECT
      current_database() AS database,
      current_user AS "user",
      now()::text AS server_time
    `,
  );

  console.log('Conexion OK');
  console.log(`database: ${row.database}`);
  console.log(`user: ${row.user}`);
  console.log(`server_time: ${row.server_time}`);
};

void checkConnection()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Fallo la conexion a PostgreSQL:', message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

