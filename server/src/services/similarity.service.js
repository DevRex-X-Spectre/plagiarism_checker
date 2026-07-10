import { embedText } from './embedding.service.js';
import pool from '../config/database.js';
import { SIMILARITY } from '../config/constants.js';

export function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }

  const denominator = Math.sqrt(na) * Math.sqrt(nb);
  if (denominator === 0) return 0;
  return dot / denominator;
}

export async function findSimilarProjects(queryText, threshold = SIMILARITY.DEFAULT_THRESHOLD, { mode = 'full' } = {}) {
  // Generate embedding for the query
  const queryEmbedding = await embedText(queryText);
  const useTitleEmbedding = mode === 'title';

  // Load all non-deleted project embeddings. Topic-only checks use topic
  // embeddings; checks with abstracts use full title+abstract embeddings.
  const result = await pool.query(
    `SELECT p.id, p.title, p.abstract, p.author_name, p.year,
            d.name as department_name,
            p.title_embedding,
            p.embedding
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     WHERE NOT p.is_deleted`
  );

  const scored = (await Promise.all(result.rows
    .map(async row => {
      const candidateEmbedding = useTitleEmbedding && row.title_embedding
        ? row.title_embedding
        : useTitleEmbedding
        ? await embedText(row.title)
        : row.embedding;
      const score = cosineSimilarity(queryEmbedding, candidateEmbedding);
      return {
        projectId: row.id,
        title: row.title,
        authorName: row.author_name,
        departmentName: row.department_name,
        year: row.year,
        score: Math.round(score * 100) / 100, // percentage with 2 decimals
        level: score >= SIMILARITY.HIGH_FLAG
          ? 'high'
          : score >= SIMILARITY.MODERATE_FLAG
          ? 'moderate'
          : 'low',
      };
    })))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score);

  return scored;
}
