import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  logout,
  getMe,
  verifyEmailHandler,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { MIN_PASSWORD_LENGTH, VALID_ROLES } from '../config/constants.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  fullName: z.string().min(2).max(100),
  role: z.enum(VALID_ROLES),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resendSchema = z.object({
  email: z.string().email(),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.get('/verify-email', verifyEmailHandler);
router.post('/resend-verification', validate(resendSchema), resendVerification);
router.post('/forgot-password', validate(forgotSchema), forgotPassword);
router.post('/reset-password', validate(resetSchema), resetPassword);

export default router;
