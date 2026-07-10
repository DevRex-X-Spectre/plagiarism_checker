import pool from '../config/database.js';

export async function listProjects({ q, department, year, page = 1, limit = 20, includeDeleted = false }) {
  const conditions = [includeDeleted ? '1=1' : 'NOT p.is_deleted'];
  const params = [];
  let idx = 1;

  if (q) {
    conditions.push(`(p.title ILIKE $${idx} OR p.abstract ILIKE $${idx})`);
    params.push(`%${q}%`);
    idx++;
  }
  if (department) {
    conditions.push(`p.department_id = $${idx++}`);
    params.push(department);
  }
  if (year) {
    conditions.push(`p.year = $${idx++}`);
    params.push(year);
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM projects p WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT p.id, p.title, p.abstract, p.author_name, p.year, p.created_at, p.is_deleted,
            d.id as department_id, d.name as department_name, d.code as department_code,
            u.full_name as uploader_name
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     JOIN users u ON u.id = p.uploaded_by
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, (page - 1) * limit]
  );

  return {
    projects: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProjectById(id) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.abstract, p.author_name, p.year, p.created_at, p.is_deleted,
            p.file_name, p.original_file_name, p.mime_type, p.file_size,
            d.id as department_id, d.name as department_name, d.code as department_code,
            u.full_name as uploader_name, u.id as uploader_id
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     JOIN users u ON u.id = p.uploaded_by
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getProjectsByUser(userId) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.abstract, p.author_name, p.year, p.created_at,
            d.name as department_name, d.code as department_code
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     WHERE p.uploaded_by = $1 AND NOT p.is_deleted
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function createProject({ title, abstract, authorName, departmentId, year, uploadedBy, titleEmbedding, embedding, fileName, originalFileName, mimeType, fileSize }) {
  const result = await pool.query(
    `INSERT INTO projects (title, abstract, author_name, department_id, year, uploaded_by, title_embedding, embedding, file_name, original_file_name, mime_type, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [title, abstract, authorName, departmentId, year, uploadedBy, titleEmbedding, embedding, fileName, originalFileName, mimeType || null, fileSize || null]
  );
  return result.rows[0];
}

export async function softDeleteProject(id) {
  await pool.query(
    'UPDATE projects SET is_deleted = true WHERE id = $1',
    [id]
  );
}

export async function getAllProjectCount() {
  const result = await pool.query('SELECT COUNT(*) FROM projects WHERE NOT is_deleted');
  return parseInt(result.rows[0].count, 10);
}

export async function getProjectStats() {
  const byDept = await pool.query(
    `SELECT d.name, COUNT(p.id) as count
     FROM departments d
     LEFT JOIN projects p ON p.department_id = d.id AND NOT p.is_deleted
     GROUP BY d.id, d.name
     ORDER BY count DESC`
  );
  const byYear = await pool.query(
    `SELECT year, COUNT(*) as count FROM projects WHERE NOT is_deleted GROUP BY year ORDER BY year DESC`
  );
  return { byDepartment: byDept.rows, byYear: byYear.rows };
}
