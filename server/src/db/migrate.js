import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns/promises';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, 'migrations');

function baseClientConfig() {
  return {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
}

async function connectClient() {
  const client = new Client(baseClientConfig());

  try {
    await client.connect();
    return client;
  } catch (err) {
    try {
      await client.end();
    } catch {}

    if (!['ETIMEDOUT', 'ENETUNREACH'].includes(err.code)) {
      throw err;
    }

    const databaseUrl = new URL(process.env.DATABASE_URL);
    const addresses = await dns.resolve4(databaseUrl.hostname);
    let lastError = err;

    for (const address of addresses) {
      const fallbackClient = new Client({
        host: address,
        port: Number(databaseUrl.port || 5432),
        database: databaseUrl.pathname.slice(1),
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false, servername: databaseUrl.hostname }
          : false,
      });

      try {
        await fallbackClient.connect();
        console.log(`Connected to database through IPv4 fallback (${address})`);
        return fallbackClient;
      } catch (fallbackError) {
        lastError = fallbackError;
        try {
          await fallbackClient.end();
        } catch {}
      }
    }

    throw lastError;
  }
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('Migration failed: DATABASE_URL is required');
    process.exit(1);
  }

  let client;

  try {
    client = await connectClient();
    console.log('Connected to database');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const applied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file]
      );
      if (applied.rowCount > 0) {
        console.log(`Skipping migration: ${file}`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      console.log(`Running migration: ${file}`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`Completed: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (err) {
    try {
      if (client) await client.query('ROLLBACK');
    } catch {}
    console.error('Migration failed:', err.message || err.code || err.name || 'Unknown error');
    if (err.code) console.error('Error code:', err.code);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    if (Array.isArray(err.errors)) {
      console.error('Inner errors:');
      for (const inner of err.errors) {
        console.error(`- ${inner.code || inner.name || 'Error'} ${inner.address || ''}${inner.port ? `:${inner.port}` : ''} ${inner.message || ''}`);
      }
    }
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

migrate();
