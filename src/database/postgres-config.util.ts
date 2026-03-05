export interface PostgresConnectionConfig {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl: false | { rejectUnauthorized: false };
}

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const normalizeString = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const hasSslModeDisabled = (url: string): boolean =>
  /[?&]sslmode=disable(?:&|$)/i.test(url);

export const resolvePostgresConnectionConfig = (
  getValue: (key: string) => string | undefined,
): PostgresConnectionConfig => {
  const supabaseUri = normalizeString(getValue('SUPABASE_URI'));
  const databaseUrl = normalizeString(getValue('DATABASE_URL'));
  const connectionUrl = supabaseUri ?? databaseUrl;

  const explicitSslFlag = normalizeString(getValue('DATABASE_SSL'));
  const ssl =
    explicitSslFlag !== undefined
      ? toBoolean(explicitSslFlag, false)
      : connectionUrl
        ? !hasSslModeDisabled(connectionUrl)
        : false;

  const sslConfig: PostgresConnectionConfig['ssl'] = ssl
    ? { rejectUnauthorized: false as const }
    : false;

  if (connectionUrl) {
    return {
      url: connectionUrl,
      ssl: sslConfig,
    };
  }

  return {
    host: getValue('DATABASE_HOST') ?? 'localhost',
    port: Number(getValue('DATABASE_PORT') ?? 5432),
    username: getValue('DATABASE_USERNAME') ?? 'midespacho',
    password: getValue('DATABASE_PASSWORD') ?? 'midespacho',
    database: getValue('DATABASE_NAME') ?? 'midespacho',
    ssl: sslConfig,
  };
};
