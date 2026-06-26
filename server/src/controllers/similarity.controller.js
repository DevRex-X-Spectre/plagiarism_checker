import { findSimilarProjects } from '../services/similarity.service.js';
import { createSimilarityCheck, getUserCheckHistory, getCheckById } from '../models/similarityCheck.model.js';
import { SIMILARITY } from '../config/constants.js';

export async function runSimilarityCheck(req, res, next) {
  try {
    const { title, abstract, threshold } = req.body;
    const userId = req.user.id;

    const queryText = abstract ? `${title.trim()} ${abstract.trim()}` : title.trim();

    if (!queryText.trim()) {
      return res.status(400).json({ error: 'Title or abstract is required' });
    }

    const normalizedThreshold = Math.max(
      SIMILARITY.MIN_THRESHOLD,
      Math.min(SIMILARITY.MAX_THRESHOLD, threshold || SIMILARITY.DEFAULT_THRESHOLD)
    );

    const results = await findSimilarProjects(queryText, normalizedThreshold);

    // Persist the check
    const check = await createSimilarityCheck({
      userId,
      queryText,
      threshold: normalizedThreshold,
      results,
    });

    res.json({
      checkId: check.id,
      threshold: normalizedThreshold,
      totalResults: results.length,
      results: results.slice(0, 50), // Cap at 50 results
      createdAt: check.created_at,
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
    const check = await getCheckById(id, req.user.id);

    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    res.json({ check });
  } catch (err) {
    next(err);
  }
}
