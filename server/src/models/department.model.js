import pool from '../config/database.js';

export async function listActiveDepartments() {
  const result = await pool.query(
    'SELECT id, name, code FROM departments WHERE is_active = true ORDER BY name'
  );
  return result.rows;
}

export async function listAllDepartments() {
  const result = await pool.query(
    'SELECT id, name, code, is_active, created_at FROM departments ORDER BY name'
  );
  return result.rows;
}

export async function findDepartmentById(id) {
  const result = await pool.query(
    'SELECT * FROM departments WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findDepartmentByName(name) {
  const result = await pool.query(
    'SELECT * FROM departments WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  return result.rows[0] || null;
}

export async function createDepartment({ name, code }) {
  const result = await pool.query(
    'INSERT INTO departments (name, code) VALUES ($1, $2) RETURNING *',
    [name, code || null]
  );
  return result.rows[0];
}

export async function updateDepartment(id, { name, code, isActive }) {
  const updates = [];
  const params = [];
  let idx = 1;

  if (name !== undefined) {
    updates.push(`name = $${idx++}`);
    params.push(name);
  }
  if (code !== undefined) {
    updates.push(`code = $${idx++}`);
    params.push(code);
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${idx++}`);
    params.push(isActive);
  }

  if (updates.length === 0) return findDepartmentById(id);

  params.push(id);
  const result = await pool.query(
    `UPDATE departments SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0];
}
