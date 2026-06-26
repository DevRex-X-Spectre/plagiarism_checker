import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { updateMe } from '../controllers/users.controller.js';
import { MIN_PASSWORD_LENGTH } from '../config/constants.js';

const router = Router();

const updateMeSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(MIN_PASSWORD_LENGTH).optional(),
});

router.patch('/me', requireAuth, validate(updateMeSchema), updateMe);

export default router;
