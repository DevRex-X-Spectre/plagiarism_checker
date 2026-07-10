import { findSimilarProjects } from '../services/similarity.service.js';
import { createSimilarityCheck, getUserCheckHistory, getCheckById } from '../models/similarityCheck.model.js';
import { SIMILARITY } from '../config/constants.js';

export async function runSimilarityCheck(req, res, next) {
  try {
    const { title, abstract } = req.body;
    const userId = req.user?.id || null;

    const queryText = abstract ? `${title.trim()} ${abstract.trim()}` : title.trim();

    if (!queryText.trim()) {
      return res.status(400).json({ error: 'Title or abstract is required' });
    }

    const normalizedThreshold = SIMILARITY.DEFAULT_THRESHOLD;

    const results = await findSimilarProjects(queryText, normalizedThreshold, {
      mode: abstract ? 'full' : 'title',
    });

    const check = userId
      ? await createSimilarityCheck({
          userId,
          queryText,
          threshold: normalizedThreshold,
          results,
        })
      : null;

    res.json({
      checkId: check?.id || null,
      threshold: normalizedThreshold,
      totalResults: results.length,
      results: results.slice(0, 50), // Cap at 50 results
      createdAt: check?.created_at || new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await getUserCheckHistory(req.user.id, {
      page: parseInt(page || '1', 10),
      limit: Math.min(parseInt(limit || '20', 10), 100),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCheck(req, res, next) {
  try {
    const { id } = req.params;
    const check = await getCheckById(id, req.user.id, req.user.role === 'admin');

    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    res.json({ check });
  } catch (err) {
    next(err);
  }
}
