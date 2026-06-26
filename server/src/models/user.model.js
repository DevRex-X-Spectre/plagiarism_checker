import pool from '../config/database.js';

export async function createUser({ email, passwordHash, fullName, role, verifyToken, verifyExpires }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, verify_token, verify_expires)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, full_name, role, is_active, email_verified, created_at`,
    [email, passwordHash, fullName, role, verifyToken, verifyExpires]
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, email, full_name, role, is_active, email_verified, created_at, last_login_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findUserByVerifyToken(token) {
  const result = await pool.query(
    'SELECT * FROM users WHERE verify_token = $1 AND verify_expires > NOW()',
    [token]
  );
  return result.rows[0] || null;
}

export async function findUserByResetToken(token) {
  const result = await pool.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
    [token]
  );
  return result.rows[0] || null;
}

export async function verifyEmail(userId) {
  await pool.query(
    'UPDATE users SET email_verified = true, verify_token = NULL, verify_expires = NULL WHERE id = $1',
    [userId]
  );
}

export async function updatePassword(userId, passwordHash) {
  await pool.query(
    'UPDATE users SET password_hash = $2, reset_token = NULL, reset_expires = NULL, updated_at = NOW() WHERE id = $1',
    [userId, passwordHash]
  );
}

export async function setResetToken(userId, token, expires) {
  await pool.query(
    'UPDATE users SET reset_token = $2, reset_expires = $3 WHERE id = $1',
    [userId, token, expires]
  );
}

export async function updateLastLogin(userId) {
  await pool.query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [userId]
  );
}

export async function listUsers({ page = 1, limit = 20, role, isActive, search }) {
  const offset = (page - 1) * limit;
  const conditions = ['1=1'];
  const params = [];
  let paramIdx = 1;

  if (role) {
    conditions.push(`role = $${paramIdx++}`);
    params.push(role);
  }
  if (isActive !== undefined) {
    conditions.push(`is_active = $${paramIdx++}`);
    params.push(isActive);
  }
  if (search) {
    conditions.push(`(email ILIKE $${paramIdx} OR full_name ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, email_verified, created_at, last_login_at
     FROM users WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
    [...params, limit, offset]
  );

  return {
    users: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUser(id, { isActive, role }) {
  const updates = [];
  const params = [];
  let idx = 1;

  if (isActive !== undefined) {
    updates.push(`is_active = $${idx++}`);
    params.push(isActive);
  }
  if (role) {
    updates.push(`role = $${idx++}`);
    params.push(role);
  }

  if (updates.length === 0) return findUserById(id);

  params.push(id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, full_name, role, is_active, email_verified, created_at`,
    params
  );
  return result.rows[0];
}
