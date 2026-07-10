import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware.js';
import {
  runSimilarityCheck,
  getHistory,
  getCheck,
} from '../controllers/similarity.controller.js';

const router = Router();

const checkSchema = z.object({
  title: z.string().min(5).max(300),
  abstract: z.string().max(3000).optional(),
});

router.post('/check', optionalAuth, validate(checkSchema), runSimilarityCheck);
router.get('/history', requireAuth, getHistory);
router.get('/:id', requireAuth, getCheck);

export default router;
