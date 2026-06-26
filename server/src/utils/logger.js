const isDev = process.env.NODE_ENV !== 'production';

export function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const entry = JSON.stringify({ timestamp, level, message, ...meta });
  if (level === 'error') {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const logger = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => {
    if (isDev) log('debug', msg, meta);
  },
};
