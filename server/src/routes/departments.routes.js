import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import {
  getActiveDepartments,
  getAllDepartments,
  createDept,
  updateDept,
  deleteDept,
} from '../controllers/departments.controller.js';

const router = Router();

const createDeptSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().max(20).optional(),
});

const updateDeptSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

router.get('/', getActiveDepartments);
router.get('/all', requireAuth, requireAdmin, getAllDepartments);
router.post('/', requireAuth, requireAdmin, validate(createDeptSchema), createDept);
router.patch('/:id', requireAuth, requireAdmin, validate(updateDeptSchema), updateDept);
router.delete('/:id', requireAuth, requireAdmin, deleteDept);

export default router;
