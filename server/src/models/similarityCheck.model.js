import pool from '../config/database.js';

export async function createSimilarityCheck({ userId, queryText, threshold, results }) {
  const result = await pool.query(
    `INSERT INTO similarity_checks (user_id, query_text, threshold, results)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, queryText, threshold, JSON.stringify(results)]
  );
  return result.rows[0];
}

export async function getCheckById(id, userId) {
  const result = await pool.query(
    `SELECT sc.*, u.full_name as user_name, u.email as user_email
     FROM similarity_checks sc
     JOIN users u ON u.id = sc.user_id
     WHERE sc.id = $1 AND (sc.user_id = $2 OR $2 = (SELECT id FROM users WHERE role = 'admin' LIMIT 1))`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getUserCheckHistory(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM similarity_checks WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT id, query_text, threshold, created_at,
            (SELECT COUNT(*) FROM jsonb_array_elements(results)) as result_count
     FROM similarity_checks
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    checks: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function listAllChecks({ page = 1, limit = 20, userId, query } = {}) {
  const conditions = ['1=1'];
  const params = [];
  let idx = 1;

  if (userId) {
    conditions.push(`sc.user_id = $${idx++}`);
    params.push(userId);
  }
  if (query) {
    conditions.push(`sc.query_text ILIKE $${idx++}`);
    params.push(`%${query}%`);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM similarity_checks sc WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT sc.id, sc.query_text, sc.threshold, sc.created_at,
            u.full_name as user_name, u.email as user_email,
            (SELECT COUNT(*) FROM jsonb_array_elements(sc.results)) as result_count
     FROM similarity_checks sc
     JOIN users u ON u.id = sc.user_id
     WHERE ${where}
     ORDER BY sc.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, offset]
  );

  return {
    checks: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCheckCount() {
  const result = await pool.query('SELECT COUNT(*) FROM similarity_checks');
  return parseInt(result.rows[0].count, 10);
}

export async function getTopSearchedTopics(limit = 10) {
  const result = await pool.query(
    `SELECT query_text, COUNT(*) as count
     FROM similarity_checks
     GROUP BY query_text
     ORDER BY count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}
