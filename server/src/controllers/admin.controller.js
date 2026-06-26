import { listUsers, updateUser } from '../models/user.model.js';
import { listProjects, softDeleteProject, getAllProjectCount, getProjectStats } from '../models/project.model.js';
import { listAllDepartments, createDepartment, updateDepartment } from '../models/department.model.js';
import { listAllChecks, getCheckCount, getTopSearchedTopics } from '../models/similarityCheck.model.js';
import pool from '../config/database.js';

export async function getAdminStats(req, res, next) {
  try {
    const [userCount, projectCount, checkCount, topTopics, projectByDept] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      getAllProjectCount(),
      getCheckCount(),
      getTopSearchedTopics(5),
      getProjectStats(),
    ]);

    const roleBreakdown = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    res.json({
      stats: {
        totalUsers: parseInt(userCount.rows[0].count, 10),
        totalProjects: projectCount,
        totalSimilarityChecks: checkCount,
        userBreakdown: roleBreakdown.rows,
        topSearchedTopics: topTopics,
        projectsByDepartment: projectByDept.byDepartment,
        projectsByYear: projectByDept.byYear,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { page, limit, role, isActive, search } = req.query;

    const result = await listUsers({
      page: parseInt(page || '1', 10),
      limit: Math.min(parseInt(limit || '20', 10), 100),
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateUserById(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await updateUser(id, { isActive, role });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await updateUser(id, { isActive: false });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated', user });
  } catch (err) {
    next(err);
  }
}

export async function getAllProjects(req, res, next) {
  try {
    const { page, limit, q, department, year } = req.query;

    const result = await listProjects({
      q,
      department,
      year: year ? parseInt(year, 10) : undefined,
      page: parseInt(page || '1', 10),
      limit: Math.min(parseInt(limit || '20', 10), 100),
      includeDeleted: true,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;

    await softDeleteProject(id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getSimilarityLogs(req, res, next) {
  try {
    const { page, limit, userId, query } = req.query;

    const result = await listAllChecks({
      page: parseInt(page || '1', 10),
      limit: Math.min(parseInt(limit || '20', 10), 100),
      userId,
      query,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function adminCreateDepartment(req, res, next) {
  try {
    const { name, code } = req.body;
    const department = await createDepartment({ name, code });
    res.status(201).json({ department });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const { name, code, isActive } = req.body;

    const department = await updateDepartment(id, { name, code, isActive });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ department });
  } catch (err) {
    next(err);
  }
}
