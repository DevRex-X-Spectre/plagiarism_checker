import dotenv from 'dotenv';
dotenv.config();

// Local mode uses a JSON file instead of PostgreSQL.
// Set USE_LOCAL_DB=true in server/.env to enable.
export const useLocalDb = process.env.USE_LOCAL_DB === 'true';

const required = ['JWT_SECRET'];

if (!useLocalDb) {
  required.push('DATABASE_URL');
}

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();

export const env = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '10000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@projectarchive.com',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cookieSameSite: ['lax', 'strict', 'none'].includes(cookieSameSite) ? cookieSameSite : 'lax',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10), // 20MB
  useLocalDb,
};
