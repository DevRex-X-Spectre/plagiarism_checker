import { hashPassword, comparePassword } from '../utils/password.js';
import { findUserById } from '../models/user.model.js';
import pool from '../config/database.js';
import { MIN_PASSWORD_LENGTH } from '../config/constants.js';

export async function updateMe(req, res, next) {
  try {
    const { fullName, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const updates = [];
    const params = [];
    let idx = 1;

    if (fullName) {
      updates.push(`full_name = $${idx++}`);
      params.push(fullName);
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }

      const user = await findUserById(userId);
      const valid = await comparePassword(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hash = await hashPassword(newPassword);
      updates.push(`password_hash = $${idx++}`);
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}
       RETURNING id, email, full_name, role, is_active, email_verified`,
      params
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
