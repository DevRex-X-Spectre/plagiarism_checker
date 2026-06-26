import { listActiveDepartments, listAllDepartments, createDepartment, updateDepartment, findDepartmentById } from '../models/department.model.js';

export async function getActiveDepartments(req, res, next) {
  try {
    const departments = await listActiveDepartments();
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}

export async function getAllDepartments(req, res, next) {
  try {
    const departments = await listAllDepartments();
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}

export async function createDept(req, res, next) {
  try {
    const { name, code } = req.validated;

    const existing = await findDepartmentById(name);
    if (existing) {
      return res.status(409).json({ error: 'Department already exists' });
    }

    const department = await createDepartment({ name, code });
    res.status(201).json({ department });
  } catch (err) {
    next(err);
  }
}

export async function updateDept(req, res, next) {
  try {
    const { id } = req.params;
    const { name, code, isActive } = req.body;

    const existing = await findDepartmentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const department = await updateDepartment(id, { name, code, isActive });
    res.json({ department });
  } catch (err) {
    next(err);
  }
}

export async function deleteDept(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await findDepartmentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Soft delete — set inactive
    await updateDepartment(id, { isActive: false });
    res.json({ message: 'Department deactivated' });
  } catch (err) {
    next(err);
  }
}
