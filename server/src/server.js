import app from './app.js';
import { env } from './config/env.js';
import { loadEmbeddingModel } from './services/embedding.service.js';
import { logger } from './utils/logger.js';

async function start() {
  try {
    // Pre-load the embedding model before accepting requests
    await loadEmbeddingModel();
    logger.info('Embedding model ready');

    app.listen(env.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
