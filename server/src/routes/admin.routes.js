import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import {
  getAdminStats,
  getUsers,
  updateUserById,
  deactivateUser,
  getAllProjects,
  deleteProject,
  getSimilarityLogs,
  adminCreateDepartment,
  adminUpdateDepartment,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require admin role
router.use(requireAuth, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUserById);
router.delete('/users/:id', deactivateUser);

router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteProject);

router.get('/similarity-logs', getSimilarityLogs);

router.post('/departments', adminCreateDepartment);
router.patch('/departments/:id', adminUpdateDepartment);

export default router;
