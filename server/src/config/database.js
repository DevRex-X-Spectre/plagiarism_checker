import { env } from './env.js';

let pool;

if (env.useLocalDb) {
  console.log('🗄️  Using local JSON file store (testing mode)');
  const { localStore } = await import('./localStore.js');
  pool = localStore;
} else {
  console.log('🐘 Using PostgreSQL database');
  const pg = await import('pg');
  const realPool = new pg.Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  realPool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  pool = realPool;
}

export default pool;
