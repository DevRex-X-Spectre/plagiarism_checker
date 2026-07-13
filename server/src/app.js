import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { errorHandler } from './middleware/error.middleware.js';
import { warmUp, isModelReady, getEmbeddingProvider } from './services/embedding.service.js';
import { env } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import similarityRoutes from './routes/similarity.routes.js';
import departmentsRoutes from './routes/departments.routes.js';
import usersRoutes from './routes/users.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Trust proxy for secure cookies behind Render's load balancer
app.set('trust proxy', 1);

app.use(cors({
  // Reflect any requesting origin so credentialed requests work from local
  // development and separately deployed frontends without an origin allowlist.
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check — warms up the embedding model on first call
app.get('/health', async (req, res) => {
  if (!isModelReady()) {
    // Trigger warm-up without blocking the response
    warmUp().catch(err => console.error('Warm-up failed:', err.message));
    return res.status(200).json({ status: 'warming_up', model: 'loading', provider: getEmbeddingProvider() });
  }
  res.status(200).json({ status: 'ok', model: 'ready', provider: getEmbeddingProvider() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/similarity', similarityRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

const clientDistPath = path.resolve('client/dist');

// Serve React app in production only when the client build exists. This keeps
// the same server usable for API-only deployments.
if (env.nodeEnv === 'production' && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  const { default: serveStatic } = await import('serve-static');
  app.use(serveStatic(clientDistPath, { index: ['index.html'] }));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

export default app;
