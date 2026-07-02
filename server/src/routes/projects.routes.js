import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  uploadProject,
  confirmUpload,
  browseProjects,
  getProject,
  getMyProjects,
  downloadProjectFile,
} from '../controllers/projects.controller.js';
import { softDeleteProject } from '../models/project.model.js';

const router = Router();

const confirmSchema = z.object({
  tempFileId: z.string().min(1),
  title: z.string().min(5).max(300),
  abstract: z.string().min(10).max(3000),
  authorName: z.string().min(2).max(100),
  departmentId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  originalFileName: z.string().max(255).optional(),
  mimeType: z.string().max(120).optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

router.get('/', browseProjects);
router.get('/my/list', requireAuth, getMyProjects);
router.get('/:id/download', downloadProjectFile);
router.get('/:id', getProject);

router.post('/upload', requireAuth, upload.single('file'), uploadProject);
router.post('/confirm', requireAuth, validate(confirmSchema), confirmUpload);

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await softDeleteProject(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
