import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cosineSimilarity } from './similarity.service.js';

test('cosineSimilarity returns 1 for identical vectors', () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
});

test('cosineSimilarity returns 0 for orthogonal vectors', () => {
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test('cosineSimilarity handles zero vectors', () => {
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
});

test('fallback embedding provider returns a normalized 384-d vector', () => {
  const script = `
    import { embedText, getEmbeddingProvider } from './src/services/embedding.service.js';
    const vector = await embedText('AI based attendance system with biometric verification');
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    console.log(JSON.stringify({
      provider: getEmbeddingProvider(),
      length: vector.length,
      magnitude: Number(magnitude.toFixed(6)),
    }));
  `;

  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', script],
    {
      cwd: new URL('../../', import.meta.url),
      env: {
        ...process.env,
        EMBEDDING_PROVIDER: 'fallback',
      },
      encoding: 'utf8',
    }
  ).trim();

  const result = JSON.parse(output);
  assert.equal(result.provider, 'fallback');
  assert.equal(result.length, 384);
  assert.equal(result.magnitude, 1);
});
