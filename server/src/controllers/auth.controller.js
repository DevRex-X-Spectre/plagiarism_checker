import { randomBytes } from 'crypto';
import {
  createUser,
  findUserByEmail,
  findUserByVerifyToken,
  findUserByResetToken,
  verifyEmail,
  updatePassword,
  setResetToken,
  updateLastLogin,
} from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { env } from '../config/env.js';
import { ROLES, VALID_ROLES, MIN_PASSWORD_LENGTH, VERIFY_TOKEN_EXPIRY_HOURS, RESET_TOKEN_EXPIRY_HOURS } from '../config/constants.js';

export async function register(req, res, next) {
  try {
    const { email, password, fullName, role } = req.validated;

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const passwordHash = await hashPassword(password);

    const verifyToken = randomBytes(32).toString('hex');
    const verifyExpires = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Check if email is in admin list
    const isAdmin = env.adminEmails.includes(email.toLowerCase());
    const assignedRole = isAdmin ? ROLES.ADMIN : role;

    const user = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: assignedRole,
      verifyToken,
      verifyExpires,
    });

    await sendVerificationEmail(user.email, verifyToken);

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated;

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    await updateLastLogin(user.id);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        emailVerified: user.email_verified,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
  });
  res.json({ message: 'Logged out successfully' });
}

export async function getMe(req, res) {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      role: req.user.role,
      emailVerified: req.user.email_verified,
    },
  });
}

export async function verifyEmailHandler(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await findUserByVerifyToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await verifyEmail(user.id);

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.validated;

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ message: 'If that email exists and is unverified, a verification email has been sent.' });
    }

    if (user.email_verified) {
      return res.json({ message: 'This email is already verified.' });
    }

    const verifyToken = randomBytes(32).toString('hex');
    const verifyExpires = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET verify_token = $2, verify_expires = $3 WHERE id = $1',
      [user.id, verifyToken, verifyExpires]
    );

    await sendVerificationEmail(user.email, verifyToken);

    res.json({ message: 'Verification email sent.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated;

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.json({ message: 'If that email exists, a reset email has been sent.' });
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await setResetToken(user.id, resetToken, resetExpires);
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'If that email exists, a reset email has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.validated;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await hashPassword(newPassword);
    await updatePassword(user.id, passwordHash);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}
