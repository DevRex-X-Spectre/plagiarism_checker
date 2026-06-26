import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware.js';
import { warmUp, isModelReady } from './services/embedding.service.js';
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
  origin: env.clientOrigin,
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
    return res.status(200).json({ status: 'warming_up', model: 'loading' });
  }
  res.status(200).json({ status: 'ok', model: 'ready' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/similarity', similarityRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Serve React app in production
if (env.nodeEnv === 'production') {
  const { default: serveStatic } = await import('serve-static');
  app.use(serveStatic('client/dist', { index: ['index.html'] }));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile('client/dist/index.html', { root: '.' });
  });
}

// Error handler
app.use(errorHandler);

export default app;
