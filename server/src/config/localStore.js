// Local JSON-file store — drop-in replacement for pg.Pool.query() when
// USE_LOCAL_DB=true. Implements the subset of SQL patterns our models use.
//
// Why: lets you run the full app on localhost with zero external services.
// To swap back to PostgreSQL, unset USE_LOCAL_DB in server/.env and set
// DATABASE_URL to your Postgres connection string.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../../local-data.json');

const genId = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

// ── Persistence ────────────────────────────────────────────────────────

function emptyData() {
  return { users: [], departments: [], projects: [], similarity_checks: [] };
}

function normalizeData(nextData) {
  let changed = false;

  for (const user of nextData.users) {
    if (user.role === 'lecturer') {
      user.role = 'student';
      changed = true;
    }
    for (const field of ['email_verified', 'verify_token', 'verify_expires']) {
      if (field in user) {
        delete user[field];
        changed = true;
      }
    }
  }

  return changed;
}

function loadFromDisk() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      const nextData = {
        users: parsed.users || [],
        departments: parsed.departments || [],
        projects: parsed.projects || [],
        similarity_checks: parsed.similarity_checks || [],
      };
      if (normalizeData(nextData)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(nextData, null, 2));
      }
      return nextData;
    } catch (err) {
      console.warn('⚠️  Could not parse local-data.json, starting fresh:', err.message);
    }
  }
  const fresh = emptyData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2));
  return fresh;
}

function saveToDisk() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let data = loadFromDisk();

// ── WHERE clause evaluator ─────────────────────────────────────────────

function buildPredicate(whereSql, params) {
  if (!whereSql || whereSql === '1=1' || whereSql.trim() === '') {
    return () => true;
  }

  // Split on top-level AND only (no parens — our queries don't use them)
  const parts = whereSql.split(/\s+AND\s+/i).map(p => p.trim());

  return (row) => parts.every(part => evaluate(part, params, row));
}

function evaluate(cond, params, row) {
  // "NOT col"
  let m = cond.match(/^NOT\s+([\w.]+)$/i);
  if (m) return !getField(row, m[1]);

  // "col IS NULL"
  m = cond.match(/^([\w.]+)\s+IS\s+NULL$/i);
  if (m) return getField(row, m[1]) == null;

  // "col IS NOT NULL"
  m = cond.match(/^([\w.]+)\s+IS\s+NOT\s+NULL$/i);
  if (m) return getField(row, m[1]) != null;

  // "col > NOW()" / "< NOW()" / etc.
  m = cond.match(/^([\w.]+)\s*(>=|<=|>|<|=|!=)\s*NOW\(\)$/i);
  if (m) {
    const col = m[1];
    const op = m[2];
    const v = getField(row, col);
    if (v == null) return op === '!=';
    const t = new Date(v).getTime();
    const now = Date.now();
    return compare(t, now, op);
  }

  // "col ILIKE $N"
  m = cond.match(/^([\w.]+)\s+ILIKE\s+\$(\d+)$/i);
  if (m) {
    const col = m[1];
    const pattern = String(params[parseInt(m[2], 10) - 1] ?? '');
    const re = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    return re.test(String(getField(row, col) ?? ''));
  }

  // "col = $N" / "col != $N" / "col < $N" etc.
  m = cond.match(/^([\w.]+)\s*(=|!=|<>|<=|>=|<|>)\s*\$(\d+)$/);
  if (m) {
    const col = m[1];
    const op = m[2];
    const a = getField(row, col);
    const b = params[parseInt(m[3], 10) - 1];
    return compareValues(a, b, op);
  }

  // Unknown — be permissive
  return true;
}

function getField(row, name) {
  if (row == null) return undefined;
  // Support "t.col" and "col"
  const key = name.includes('.') ? name.split('.').pop() : name;
  return row[key];
}

function compareValues(a, b, op) {
  if (op === '=') return a == b;
  if (op === '!=' || op === '<>') return a != b;
  // For >, <, >=, <= try to compare as numbers/dates
  const na = toNumber(a);
  const nb = toNumber(b);
  if (na !== undefined && nb !== undefined) {
    return compare(na, nb, op);
  }
  return false;
}

function toNumber(v) {
  if (v == null) return undefined;
  if (typeof v === 'number') return v;
  const d = new Date(v);
  if (!isNaN(d.getTime()) && typeof v === 'string' && /\d{4}-\d{2}-\d{2}/.test(v)) {
    return d.getTime();
  }
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function compare(a, b, op) {
  if (op === '=') return a === b;
  if (op === '!=' || op === '<>') return a !== b;
  if (op === '>') return a > b;
  if (op === '<') return a < b;
  if (op === '>=') return a >= b;
  if (op === '<=') return a <= b;
  return false;
}

// ── SELECT projection helper ───────────────────────────────────────────

function projectColumns(row, selectSql) {
  // Extract just the SELECT list (before FROM)
  const m = selectSql.match(/^SELECT\s+(.+?)\s+FROM/is);
  if (!m) return row;
  const list = m[1];

  // COUNT(*) — return count-style row
  if (/COUNT\s*\(\s*\*\s*\)/i.test(list) && !/,/.test(list)) {
    return { count: row.count ?? row.__count };
  }

  // "col1, col2, COUNT(col) as count" patterns — for grouped queries
  if (/COUNT/i.test(list)) {
    return row; // already shaped
  }

  // SELECT * — return everything (but strip password_hash for users)
  if (/^\*/.test(list.trim())) {
    if (row.password_hash !== undefined) {
      const { password_hash, ...rest } = row;
      return rest;
    }
    return { ...row };
  }

  // Specific columns — handle "table.col AS alias"
  const cols = list.split(',').map(c => c.trim());
  const result = {};
  for (const colSpec of cols) {
    // Strip COUNT() etc — only handled above
    const aliasMatch = colSpec.match(/(?:[\w.]+)\s+(?:AS\s+)?(\w+)$/i);
    if (aliasMatch) {
      const alias = aliasMatch[1];
      // Find the actual field name
      const fieldMatch = colSpec.match(/([\w.]+)(?:\s|$)/);
      if (fieldMatch) {
        result[alias] = getField(row, fieldMatch[1]);
      }
    } else {
      const fieldMatch = colSpec.match(/([\w.]+)/);
      if (fieldMatch) {
        result[fieldMatch[1].split('.').pop()] = getField(row, fieldMatch[1]);
      }
    }
  }
  return result;
}

function applyReturning(row, sql) {
  const m = sql.match(/RETURNING\s+(.+?)$/is);
  if (!m) return stripPasswordHash(row);
  const cols = m[1].split(',').map(c => c.trim());
  const result = {};
  for (const c of cols) {
    const fieldMatch = c.match(/([\w.]+)(?:\s+AS\s+(\w+))?$/i);
    if (fieldMatch) {
      const key = fieldMatch[2] || fieldMatch[1].split('.').pop();
      result[key] = getField(row, fieldMatch[1]);
    }
  }
  return result;
}

function stripPasswordHash(row) {
  if (row && 'password_hash' in row) {
    const { password_hash, ...rest } = row;
    return rest;
  }
  return row;
}

// ── ORDER BY helper ────────────────────────────────────────────────────

function buildSort(orderSql) {
  if (!orderSql) return null;
  const m = orderSql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
  if (!m) return null;
  const specs = m[1].split(',').map(s => s.trim());

  return (a, b) => {
    for (const spec of specs) {
      const sm = spec.match(/([\w.]+)(?:\s+(ASC|DESC))?/i);
      if (!sm) continue;
      const col = sm[1].split('.').pop();
      const dir = (sm[2] || 'ASC').toUpperCase();
      const av = getField(a, col);
      const bv = getField(b, col);
      if (av == null && bv == null) continue;
      if (av == null) return dir === 'ASC' ? 1 : -1;
      if (bv == null) return dir === 'ASC' ? -1 : 1;
      if (av < bv) return dir === 'ASC' ? -1 : 1;
      if (av > bv) return dir === 'ASC' ? 1 : -1;
    }
    return 0;
  };
}

function extractLimitOffset(sql) {
  const limitM = sql.match(/LIMIT\s+\$(\d+)/i);
  const offsetM = sql.match(/OFFSET\s+\$(\d+)/i);
  const limit = limitM ? parseInt(limitM[1], 10) : null;
  const offset = offsetM ? parseInt(offsetM[1], 10) : null;
  return { limit, offset };
}

function getParam(sql, params, name) {
  const m = sql.match(new RegExp(name + '\\s+\\$(\\d+)', 'i'));
  return m ? params[parseInt(m[1], 10) - 1] : undefined;
}

// ── JOIN expansion ─────────────────────────────────────────────────────

function expandProjectRow(row) {
  const dept = data.departments.find(d => d.id === row.department_id);
  const uploader = data.users.find(u => u.id === row.uploaded_by);
  const { password_hash, ...uploaderSafe } = uploader || {};
  return {
    ...row,
    department_id: dept?.id,
    department_name: dept?.name,
    department_code: dept?.code,
    uploader_id: uploader?.id,
    uploader_name: uploaderSafe?.full_name,
  };
}

// ── Query dispatcher ───────────────────────────────────────────────────

export const localStore = {
  async query(sql, params = []) {
    sql = sql.trim().replace(/;$/, '');
    const upper = sql.toUpperCase();

    // INSERT INTO users
    if (/^INSERT\s+INTO\s+USERS\b/i.test(sql)) {
      const m = sql.match(/INSERT\s+INTO\s+users\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      const cols = m[1].split(',').map(c => c.trim());
      const placeholders = m[2].split(',').map(c => c.trim());
      const row = {
        id: genId(),
        is_active: true,
        reset_token: null,
        reset_expires: null,
        created_at: nowIso(),
        updated_at: nowIso(),
        last_login_at: null,
      };
      cols.forEach((col, i) => {
        const pIdx = parseInt(placeholders[i].replace('$', ''), 10) - 1;
        row[col] = params[pIdx];
      });
      data.users.push(row);
      saveToDisk();
      return { rows: [applyReturning(row, sql)], rowCount: 1 };
    }

    // UPDATE users
    if (/^UPDATE\s+users\s+SET/i.test(sql)) {
      const setM = sql.match(/SET\s+(.+?)\s+WHERE\s+(.+)$/is);
      const setClauses = setM[1].split(',').map(s => s.trim());
      const where = setM[2];

      const predicate = buildPredicate(where, params);
      let count = 0;

      for (const row of data.users) {
        if (!predicate(row)) continue;
        for (const clause of setClauses) {
          const cm = clause.match(/^([\w.]+)\s*=\s*(.+)$/);
          if (!cm) continue;
          const col = cm[1];
          const valExpr = cm[2].trim();
          if (/^NOW\(\)$/i.test(valExpr)) {
            row[col] = nowIso();
          } else if (/^NULL$/i.test(valExpr)) {
            row[col] = null;
          } else if (/^\$(\d+)$/.test(valExpr)) {
            const idx = parseInt(valExpr.replace('$', ''), 10) - 1;
            row[col] = params[idx];
          } else if (/^true$/i.test(valExpr)) {
            row[col] = true;
          } else if (/^false$/i.test(valExpr)) {
            row[col] = false;
          }
        }
        row.updated_at = nowIso();
        count++;
      }
      saveToDisk();

      const returning = /RETURNING/i.test(sql);
      const returnedRows = returning ? data.users.filter(predicate) : [];
      return { rows: returning ? returnedRows.map(r => applyReturning(r, sql)) : [], rowCount: count };
    }

    // SELECT * FROM users WHERE email
    if (/^SELECT\s+\*\s+FROM\s+users\s+WHERE\s+email/i.test(sql)) {
      const m = sql.match(/WHERE\s+email\s*=\s*\$(\d+)/i);
      const email = params[parseInt(m[1], 10) - 1];
      const found = data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
      return { rows: found ? [{ ...found }] : [], rowCount: found ? 1 : 0 };
    }

    // SELECT * FROM users WHERE reset_token
    if (/^SELECT\s+\*\s+FROM\s+users\s+WHERE\s+reset_token/i.test(sql)) {
      const m = sql.match(/reset_token\s*=\s*\$(\d+)/i);
      const token = params[parseInt(m[1], 10) - 1];
      const found = data.users.find(u => u.reset_token === token && u.reset_expires && new Date(u.reset_expires) > new Date());
      return { rows: found ? [{ ...found }] : [], rowCount: found ? 1 : 0 };
    }

    // SELECT id, email, ... FROM users WHERE id = $1
    if (/^SELECT\s+id,\s*email,\s*full_name,\s*role,\s*is_active\s+FROM\s+users\s+WHERE\s+id/i.test(sql)) {
      const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
      const id = params[parseInt(m[1], 10) - 1];
      const found = data.users.find(u => u.id === id);
      if (!found) return { rows: [], rowCount: 0 };
      return { rows: [applyReturning(found, sql)], rowCount: 1 };
    }

    // SELECT id, email, ..., last_login_at FROM users WHERE id (full)
    if (/^SELECT\s+id,\s*email,\s*password_hash,\s*full_name,\s*role,\s*is_active,\s*created_at,\s*last_login_at\s+FROM\s+users\s+WHERE\s+id/i.test(sql)) {
      const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
      const id = params[parseInt(m[1], 10) - 1];
      const found = data.users.find(u => u.id === id);
      return { rows: found ? [applyReturning(found, sql)] : [], rowCount: found ? 1 : 0 };
    }

    // SELECT id, email, full_name, role, is_active, created_at FROM users WHERE 1=1
    if (/^SELECT\s+id,\s*email,\s*full_name,\s*role,\s*is_active,\s*created_at/i.test(sql) && /\sFROM\s+users\s+WHERE\s+1=1/i.test(sql)) {
      const whereM = sql.match(/WHERE\s+(.+?)\s+ORDER\s+BY/i);
      const where = whereM ? whereM[1] : '1=1';
      const predicate = buildPredicate(where, params);

      let rows = data.users.filter(predicate).map(stripPasswordHash);
      const sortFn = buildSort(sql);
      if (sortFn) rows.sort(sortFn);
      const { limit, offset } = extractLimitOffset(sql);
      if (offset != null) rows = rows.slice(offset);
      if (limit != null) rows = rows.slice(0, limit);

      return { rows: rows.map(r => applyReturning(r, 'RETURNING id, email, full_name, role, is_active, created_at, last_login_at')), rowCount: rows.length };
    }

    // SELECT COUNT(*) FROM users
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+users/i.test(sql)) {
      const whereM = sql.match(/WHERE\s+(.+?)$/i);
      const where = whereM ? whereM[1] : '1=1';
      const predicate = buildPredicate(where, params);
      const count = data.users.filter(predicate).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // SELECT COUNT(*) FROM users (no WHERE — admin stats)
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+users\s*$/i.test(sql)) {
      return { rows: [{ count: String(data.users.length) }], rowCount: 1 };
    }

    // ── Departments ────────────────────────────────────────────────

    if (/^INSERT\s+INTO\s+departments\b/i.test(sql)) {
      const m = sql.match(/INSERT\s+INTO\s+departments\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      const cols = m[1].split(',').map(c => c.trim());
      const placeholders = m[2].split(',').map(c => c.trim());
      const row = {
        id: genId(),
        is_active: true,
        created_at: nowIso(),
      };
      cols.forEach((col, i) => {
        const pIdx = parseInt(placeholders[i].replace('$', ''), 10) - 1;
        row[col] = params[pIdx];
      });
      data.departments.push(row);
      saveToDisk();
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (/^UPDATE\s+departments\s+SET/i.test(sql)) {
      const setM = sql.match(/SET\s+(.+?)\s+WHERE\s+id\s*=\s*\$(\d+)/is);
      if (!setM) throw new Error('Bad UPDATE departments SQL: ' + sql);
      const setClauses = setM[1].split(',').map(s => s.trim());
      const id = params[parseInt(setM[2], 10) - 1];

      const dept = data.departments.find(d => d.id === id);
      if (!dept) return { rows: [], rowCount: 0 };

      for (const clause of setClauses) {
        const cm = clause.match(/^([\w.]+)\s*=\s*(.+)$/);
        if (!cm) continue;
        const col = cm[1];
        const valExpr = cm[2].trim();
        if (/^NULL$/i.test(valExpr)) dept[col] = null;
        else if (/^true$/i.test(valExpr)) dept[col] = true;
        else if (/^false$/i.test(valExpr)) dept[col] = false;
        else if (/^\$(\d+)$/.test(valExpr)) {
          dept[col] = params[parseInt(valExpr.replace('$', ''), 10) - 1];
        }
      }
      saveToDisk();
      return { rows: [{ ...dept }], rowCount: 1 };
    }

    if (/^SELECT\s+\*\s+FROM\s+departments\s+WHERE\s+id/i.test(sql)) {
      const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
      const id = params[parseInt(m[1], 10) - 1];
      const found = data.departments.find(d => d.id === id);
      return { rows: found ? [{ ...found }] : [], rowCount: found ? 1 : 0 };
    }

    if (/^SELECT\s+\*\s+FROM\s+departments\s+WHERE\s+LOWER/i.test(sql)) {
      const m = sql.match(/LOWER\(name\)\s*=\s*LOWER\(\$(\d+)\)/i);
      const name = params[parseInt(m[1], 10) - 1];
      const found = data.departments.find(d => d.name.toLowerCase() === String(name).toLowerCase());
      return { rows: found ? [{ ...found }] : [], rowCount: found ? 1 : 0 };
    }

    if (/^SELECT\s+id,\s*name,\s*code\s+FROM\s+departments\s+WHERE\s+is_active\s*=\s*true\s+ORDER\s+BY\s+name/i.test(sql)) {
      const rows = data.departments
        .filter(d => d.is_active)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(d => ({ id: d.id, name: d.name, code: d.code }));
      return { rows, rowCount: rows.length };
    }

    if (/^SELECT\s+id,\s*name,\s*code,\s*is_active,\s*created_at\s+FROM\s+departments\s+ORDER\s+BY\s+name/i.test(sql)) {
      const rows = [...data.departments].sort((a, b) => a.name.localeCompare(b.name));
      return { rows, rowCount: rows.length };
    }

    // ── Projects ───────────────────────────────────────────────────

    if (/^INSERT\s+INTO\s+projects\b/i.test(sql)) {
      const m = sql.match(/INSERT\s+INTO\s+projects\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      const cols = m[1].split(',').map(c => c.trim());
      const placeholders = m[2].split(',').map(c => c.trim());
      const row = {
        id: genId(),
        is_deleted: false,
        created_at: nowIso(),
      };
      cols.forEach((col, i) => {
        const pIdx = parseInt(placeholders[i].replace('$', ''), 10) - 1;
        row[col] = params[pIdx];
      });
      data.projects.push(row);
      saveToDisk();
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (/^UPDATE\s+projects\s+SET\s+is_deleted\s*=\s*true\s+WHERE\s+id/i.test(sql)) {
      const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
      const id = params[parseInt(m[1], 10) - 1];
      const project = data.projects.find(p => p.id === id);
      if (project) {
        project.is_deleted = true;
        saveToDisk();
      }
      return { rows: [], rowCount: project ? 1 : 0 };
    }

    // SELECT COUNT(*) FROM projects p WHERE [conditions]
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+projects\s+p\s+WHERE/i.test(sql)) {
      const whereM = sql.match(/WHERE\s+(.+?)$/i);
      const where = whereM ? whereM[1] : '1=1';
      const predicate = buildPredicate(where, params);
      const count = data.projects.filter(p => !p.is_deleted).filter(predicate).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // SELECT COUNT(*) FROM projects WHERE NOT is_deleted
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+projects\s+WHERE\s+NOT\s+is_deleted/i.test(sql)) {
      const count = data.projects.filter(p => !p.is_deleted).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // SELECT d.name, COUNT(p.id) FROM departments d LEFT JOIN ...
    if (/^SELECT\s+d\.name,\s*COUNT\(p\.id\)/i.test(sql)) {
      const rows = data.departments.map(d => ({
        name: d.name,
        count: String(data.projects.filter(p => p.department_id === d.id && !p.is_deleted).length),
      })).sort((a, b) => Number(b.count) - Number(a.count));
      return { rows, rowCount: rows.length };
    }

    // SELECT year, COUNT(*) FROM projects WHERE NOT is_deleted GROUP BY year
    if (/^SELECT\s+year,\s*COUNT\(\*\)\s+FROM\s+projects/i.test(sql)) {
      const counts = {};
      for (const p of data.projects) {
        if (p.is_deleted) continue;
        counts[p.year] = (counts[p.year] || 0) + 1;
      }
      const rows = Object.entries(counts)
        .map(([year, count]) => ({ year: Number(year), count: String(count) }))
        .sort((a, b) => b.year - a.year);
      return { rows, rowCount: rows.length };
    }

    // SELECT p.id, ... FROM projects p JOIN ... (full list)
    if (/^SELECT\s+p\.id,\s*p\.title,\s*p\.abstract,\s*p\.author_name,\s*p\.year,\s*p\.created_at/i.test(sql) && /\bd\.id\s+as\s+department_id/i.test(sql)) {
      const whereM = sql.match(/WHERE\s+(.+?)\s+ORDER\s+BY/i);
      const where = whereM ? whereM[1] : '1=1';
      const predicate = buildPredicate(where, params);

      let rows = data.projects.filter(predicate).map(expandProjectRow);

      const sortFn = buildSort(sql);
      if (sortFn) rows.sort(sortFn);
      const { limit, offset } = extractLimitOffset(sql);
      if (offset != null) rows = rows.slice(offset);
      if (limit != null) rows = rows.slice(0, limit);

      // Project to the requested columns
      const projected = rows.map(r => ({
        id: r.id,
        title: r.title,
        abstract: r.abstract,
        author_name: r.author_name,
        year: r.year,
        created_at: r.created_at,
        is_deleted: r.is_deleted,
        department_id: r.department_id,
        department_name: r.department_name,
        department_code: r.department_code,
        uploader_name: r.uploader_name,
      }));
      return { rows: projected, rowCount: projected.length };
    }

    // SELECT p.id, ... FROM projects p JOIN ... WHERE p.id = $1 (single project with is_deleted)
    if (/^SELECT\s+p\.id,\s*p\.title,\s*p\.abstract,\s*p\.author_name,\s*p\.year,\s*p\.created_at,\s*p\.is_deleted/i.test(sql)) {
      const m = sql.match(/WHERE\s+p\.id\s*=\s*\$(\d+)/i);
      const id = params[parseInt(m[1], 10) - 1];
      const project = data.projects.find(p => p.id === id);
      if (!project) return { rows: [], rowCount: 0 };
      const expanded = expandProjectRow(project);
      return { rows: [expanded], rowCount: 1 };
    }

    // SELECT p.id, ... FROM projects p JOIN ... WHERE p.uploaded_by = $1 AND NOT p.is_deleted
    if (/^SELECT\s+p\.id,\s*p\.title,\s*p\.abstract,\s*p\.author_name,\s*p\.year,\s*p\.created_at,\s+d\.name\s+as\s+department_name/i.test(sql)) {
      const m = sql.match(/WHERE\s+p\.uploaded_by\s*=\s*\$(\d+)/i);
      const userId = params[parseInt(m[1], 10) - 1];
      const rows = data.projects
        .filter(p => p.uploaded_by === userId && !p.is_deleted)
        .map(expandProjectRow)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(r => ({
          id: r.id,
          title: r.title,
          abstract: r.abstract,
          author_name: r.author_name,
          year: r.year,
          created_at: r.created_at,
          department_name: r.department_name,
          department_code: r.department_code,
        }));
      return { rows, rowCount: rows.length };
    }

    // SELECT p.id, p.title, p.abstract, p.author_name, p.year, d.name as department_name, p.embedding
    // FROM projects p JOIN departments d ON d.id = p.department_id WHERE NOT p.is_deleted
    // (used by similarity service to load all embeddings)
    if (/^SELECT\s+p\.id,\s*p\.title,\s*p\.abstract,\s*p\.author_name,\s*p\.year,\s+d\.name\s+as\s+department_name,\s+p\.embedding\s+FROM\s+projects\s+p\s+JOIN\s+departments\s+d\s+ON\s+d\.id\s*=\s*p\.department_id\s+WHERE\s+NOT\s+p\.is_deleted/i.test(sql)) {
      const rows = data.projects
        .filter(p => !p.is_deleted)
        .map(p => {
          const dept = data.departments.find(d => d.id === p.department_id);
          return {
            id: p.id,
            title: p.title,
            abstract: p.abstract,
            author_name: p.author_name,
            year: p.year,
            department_name: dept?.name,
            embedding: p.embedding,
          };
        });
      return { rows, rowCount: rows.length };
    }

    // ── Similarity checks ──────────────────────────────────────────

    if (/^INSERT\s+INTO\s+similarity_checks\b/i.test(sql)) {
      const m = sql.match(/INSERT\s+INTO\s+similarity_checks\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      const cols = m[1].split(',').map(c => c.trim());
      const placeholders = m[2].split(',').map(c => c.trim());
      const row = {
        id: genId(),
        created_at: nowIso(),
      };
      cols.forEach((col, i) => {
        const pIdx = parseInt(placeholders[i].replace('$', ''), 10) - 1;
        let val = params[pIdx];
        // JSON.stringify is called by the model for the results param — undo it
        if (col === 'results' && typeof val === 'string') {
          try { val = JSON.parse(val); } catch {}
        }
        row[col] = val;
      });
      data.similarity_checks.push(row);
      saveToDisk();
      return { rows: [{ ...row }], rowCount: 1 };
    }

    // SELECT sc.*, u.full_name ... WHERE sc.id = $1 AND ...
    if (/^SELECT\s+sc\.\*,\s*u\.full_name\s+as\s+user_name/i.test(sql)) {
      const idM = sql.match(/sc\.id\s*=\s*\$(\d+)/i);
      const userIdM = sql.match(/sc\.user_id\s*=\s*\$(\d+)/i);
      const checkId = params[parseInt(idM[1], 10) - 1];
      const userId = params[parseInt(userIdM[1], 10) - 1];
      const check = data.similarity_checks.find(c => c.id === checkId);
      if (!check) return { rows: [], rowCount: 0 };
      // Allow if user owns it OR user is admin
      if (check.user_id !== userId) {
        const isAdmin = data.users.find(u => u.id === userId)?.role === 'admin';
        if (!isAdmin) return { rows: [], rowCount: 0 };
      }
      const user = data.users.find(u => u.id === check.user_id);
      const { password_hash, ...userSafe } = user || {};
      return { rows: [{ ...check, user_name: userSafe?.full_name, user_email: userSafe?.email }], rowCount: 1 };
    }

    // SELECT id, query_text, threshold, created_at, (SELECT COUNT(*) FROM jsonb_array_elements(results)) as result_count
    // FROM similarity_checks WHERE user_id = $1 ORDER BY created_at DESC
    if (/SELECT\s+id,\s*query_text,\s*threshold,\s*created_at/i.test(sql) && /similarity_checks/i.test(sql) && /WHERE\s+user_id/i.test(sql)) {
      const m = sql.match(/WHERE\s+user_id\s*=\s*\$(\d+)/i);
      const userId = params[parseInt(m[1], 10) - 1];
      let rows = data.similarity_checks
        .filter(c => c.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(c => ({
          id: c.id,
          query_text: c.query_text,
          threshold: c.threshold,
          created_at: c.created_at,
          result_count: Array.isArray(c.results) ? c.results.length : 0,
        }));

      const { limit, offset } = extractLimitOffset(sql);
      if (offset != null) rows = rows.slice(offset);
      if (limit != null) rows = rows.slice(0, limit);
      return { rows, rowCount: rows.length };
    }

    // SELECT sc.id, sc.query_text, sc.threshold, sc.created_at, u.full_name, u.email, count
    if (/^SELECT\s+sc\.id,\s*sc\.query_text/i.test(sql)) {
      const whereM = sql.match(/WHERE\s+(.+?)\s+ORDER\s+BY/i);
      const where = whereM ? whereM[1] : '1=1';
      const predicate = buildPredicate(where, params);

      let rows = data.similarity_checks
        .filter(predicate)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(c => {
          const user = data.users.find(u => u.id === c.user_id);
          const { password_hash, ...userSafe } = user || {};
          return {
            id: c.id,
            query_text: c.query_text,
            threshold: c.threshold,
            created_at: c.created_at,
            user_name: userSafe?.full_name,
            user_email: userSafe?.email,
            result_count: Array.isArray(c.results) ? c.results.length : 0,
          };
        });

      const { limit, offset } = extractLimitOffset(sql);
      if (offset != null) rows = rows.slice(offset);
      if (limit != null) rows = rows.slice(0, limit);
      return { rows, rowCount: rows.length };
    }

    // SELECT COUNT(*) FROM similarity_checks WHERE user_id = $1
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+similarity_checks\s+WHERE\s+user_id/i.test(sql)) {
      const m = sql.match(/WHERE\s+user_id\s*=\s*\$(\d+)/i);
      const userId = params[parseInt(m[1], 10) - 1];
      const count = data.similarity_checks.filter(c => c.user_id === userId).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // SELECT COUNT(*) FROM similarity_checks WHERE 1=1 ...
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+similarity_checks(?:\s+sc)?\s+WHERE\s+1=1/i.test(sql)) {
      const whereM = sql.match(/WHERE\s+(.+?)$/i);
      const where = whereM ? whereM[1] : '1=1';
      const predicate = buildPredicate(where, params);
      const count = data.similarity_checks.filter(predicate).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // SELECT COUNT(*) FROM similarity_checks
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+similarity_checks\s*$/i.test(sql)) {
      return { rows: [{ count: String(data.similarity_checks.length) }], rowCount: 1 };
    }

    // SELECT query_text, COUNT(*) ... GROUP BY query_text
    if (/^SELECT\s+query_text,\s*COUNT/i.test(sql)) {
      const counts = {};
      for (const c of data.similarity_checks) {
        counts[c.query_text] = (counts[c.query_text] || 0) + 1;
      }
      let rows = Object.entries(counts)
        .map(([query_text, count]) => ({ query_text, count: String(count) }))
        .sort((a, b) => Number(b.count) - Number(a.count));
      const limitM = sql.match(/LIMIT\s+\$(\d+)/i);
      if (limitM) rows = rows.slice(0, parseInt(params[parseInt(limitM[1], 10) - 1], 10));
      return { rows, rowCount: rows.length };
    }

    // SELECT role, COUNT(*) FROM users GROUP BY role
    if (/^SELECT\s+role,\s*COUNT/i.test(sql)) {
      const counts = {};
      for (const u of data.users) {
        counts[u.role] = (counts[u.role] || 0) + 1;
      }
      const rows = Object.entries(counts).map(([role, count]) => ({ role, count: String(count) }));
      return { rows, rowCount: rows.length };
    }

    // SELECT COUNT(*) FROM projects WHERE NOT is_deleted (single line, no JOIN)
    if (/^SELECT\s+COUNT\(\*\)\s+FROM\s+projects\s+WHERE\s+NOT\s+is_deleted/i.test(sql)) {
      const count = data.projects.filter(p => !p.is_deleted).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // Special: SELECT for requireAuth — single user lookup with password_hash
    // (covered above for id-based)

    throw new Error(`localStore: unhandled query pattern:\n${sql}`);
  },

  // Helper for similarity service: load all active project embeddings
  async _getAllEmbeddings() {
    return data.projects
      .filter(p => !p.is_deleted)
      .map(p => {
        const dept = data.departments.find(d => d.id === p.department_id);
        return {
          id: p.id,
          title: p.title,
          abstract: p.abstract,
          author_name: p.author_name,
          year: p.year,
          department_name: dept?.name,
          embedding: p.embedding,
        };
      });
  },

  // Reset to empty
  async _reset() {
    data = emptyData();
    saveToDisk();
  },

  // Direct read access (for seeding)
  _getData() {
    return data;
  },
};
