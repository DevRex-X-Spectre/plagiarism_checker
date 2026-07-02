import test from 'node:test';
import assert from 'node:assert/strict';
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
