import { verifyToken } from '../utils/jwt.js';
import pool from '../config/database.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token);

    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please login again' });
    }
    return res.status(401).json({ error: 'Invalid session' });
  }
}

export function optionalAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    req.user = { ...decoded, id: decoded.userId };
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
