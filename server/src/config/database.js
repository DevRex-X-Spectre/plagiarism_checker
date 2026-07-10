import { env } from './env.js';
import dns from 'dns/promises';

let pool;

function shouldUseSsl(connectionString) {
  if (env.nodeEnv === 'production') return true;

  try {
    const url = new URL(connectionString);
    return ['require', 'verify-full', 'verify-ca'].includes(url.searchParams.get('sslmode'));
  } catch {
    return false;
  }
}

async function buildPoolConfig() {
  const common = {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
  };
  const ssl = shouldUseSsl(env.databaseUrl) ? { rejectUnauthorized: false } : false;

  try {
    const url = new URL(env.databaseUrl);

    if (url.hostname.endsWith('.neon.tech')) {
      const [host] = await dns.resolve4(url.hostname);
      return {
        ...common,
        host,
        port: Number(url.port || 5432),
        database: url.pathname.slice(1),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        ssl: ssl ? { ...ssl, servername: url.hostname } : false,
      };
    }
  } catch (err) {
    console.warn('Could not build provider-specific database config, using connection string', err.message);
  }

  return {
    ...common,
    connectionString: env.databaseUrl,
    ssl,
  };
}

if (env.useLocalDb) {
  console.log('🗄️  Using local JSON file store (testing mode)');
  const { localStore } = await import('./localStore.js');
  pool = localStore;
} else {
  console.log('🐘 Using PostgreSQL database');
  const pg = await import('pg');
  const realPool = new pg.Pool(await buildPoolConfig());

  realPool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  pool = realPool;
}

export default pool;
