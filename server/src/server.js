import app from './app.js';
import { env } from './config/env.js';
import { warmUp } from './services/embedding.service.js';
import { logger } from './utils/logger.js';

async function start() {
  try {
    app.listen(env.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
      warmUp()
        .then(() => logger.info('Embedding model ready'))
        .catch(err => logger.error('Embedding warm-up failed', { error: err.message }));
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
