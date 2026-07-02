import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseDocument } from '../services/documentParser.service.js';
import { extractFields } from '../services/fieldExtractor.service.js';
import { embedText } from '../services/embedding.service.js';
import { createProject, listProjects, getProjectById, getProjectsByUser, softDeleteProject } from '../models/project.model.js';
import { listActiveDepartments } from '../models/department.model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_BASE = join(__dirname, '../../uploads');

export async function uploadProject(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const text = await parseDocument(filePath, req.file.mimetype);
    const fields = extractFields(text);

    // Get active departments for user to select from
    const departments = await listActiveDepartments();

    // If department was extracted, try to find a matching department
    let suggestedDepartmentId = null;
    if (fields.department) {
      const match = departments.find(
        d => d.name.toLowerCase() === fields.department.toLowerCase() ||
             d.code?.toLowerCase() === fields.department.toLowerCase()
      );
      if (match) suggestedDepartmentId = match.id;
    }

    res.json({
      tempFileId: req.file.filename, // Store filename for confirmation
      originalFileName: req.file.originalname,
      fields,
      departments,
      suggestedDepartmentId,
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmUpload(req, res, next) {
  try {
    const { tempFileId, title, abstract, authorName, departmentId, year, originalFileName, mimeType, fileSize } = req.validated;
    const userId = req.user.id;

    // Generate embedding from title + abstract
    const embeddingText = `${title.trim()} ${abstract.trim()}`;
    const embedding = await embedText(embeddingText);

    const project = await createProject({
      title: title.trim(),
      abstract: abstract.trim(),
      authorName: authorName.trim(),
      departmentId,
      year,
      uploadedBy: userId,
      embedding,
      fileName: tempFileId,
      originalFileName: originalFileName || tempFileId,
      mimeType,
      fileSize,
    });

    res.status(201).json({
      message: 'Project uploaded successfully',
      project: {
        id: project.id,
        title: project.title,
        abstract: project.abstract,
        authorName: project.author_name,
        year: project.year,
        createdAt: project.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadProjectFile(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project || project.is_deleted || !project.file_name) {
      return res.status(404).json({ error: 'Project file not found' });
    }

    const filePath = join(UPLOAD_BASE, project.file_name);
    res.download(filePath, project.original_file_name || project.file_name);
  } catch (err) {
    next(err);
  }
}

export async function browseProjects(req, res, next) {
  try {
    const { q, department, year, page, limit } = req.query;

    const result = await listProjects({
      q,
      department,
      year: year ? parseInt(year, 10) : undefined,
      page: parseInt(page || '1', 10),
      limit: Math.min(parseInt(limit || '20', 10), 100),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const { id } = req.params;

    const project = await getProjectById(id);
    if (!project || project.is_deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function getMyProjects(req, res, next) {
  try {
    const projects = await getProjectsByUser(req.user.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}
