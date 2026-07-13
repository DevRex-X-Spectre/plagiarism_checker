import { pipeline, env } from '@huggingface/transformers';
import { fileURLToPath } from 'url';
import { EMBEDDING_DIMENSION } from '../config/constants.js';
import { logger } from '../utils/logger.js';

let embeddingPipeline = null;
let modelReady = false;
let resolvedProvider = process.env.EMBEDDING_PROVIDER?.trim().toLowerCase() || 'auto';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const LOCAL_MODEL_ROOT = fileURLToPath(new URL('../../models/', import.meta.url));
const EMBEDDING_STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'into',
  'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with',
]);

env.localModelPath = LOCAL_MODEL_ROOT;
env.useBrowserCache = false;

if (resolvedProvider === 'fallback') {
  env.allowRemoteModels = false;
}

if (resolvedProvider === 'transformers') {
  env.allowRemoteModels = true;
}

export async function loadEmbeddingModel() {
  if (resolvedProvider === 'fallback') {
    modelReady = true;
    return null;
  }

  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  logger.info('Loading embedding model', {
    model: MODEL_NAME,
    provider: resolvedProvider,
    localModelPath: env.localModelPath,
    allowRemoteModels: env.allowRemoteModels,
  });

  try {
    embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
      dtype: 'fp32',
    });
    modelReady = true;
    resolvedProvider = 'transformers';
    logger.info('Embedding model loaded successfully', {
      model: MODEL_NAME,
      provider: resolvedProvider,
    });
    return embeddingPipeline;
  } catch (err) {
    if (resolvedProvider === 'transformers') {
      logger.error('Embedding model failed to load with transformers provider', {
        model: MODEL_NAME,
        error: err.message,
      });
      throw err;
    }

    resolvedProvider = 'fallback';
    modelReady = true;
    logger.warn('Falling back to local hashed embedding provider', {
      model: MODEL_NAME,
      error: err.message,
    });
    return null;
  }
}

export async function embedText(text) {
  if (!embeddingPipeline) {
    await loadEmbeddingModel();
  }

  if (resolvedProvider === 'fallback') {
    return embedTextFallback(text);
  }

  const result = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert tensor to plain array
  const embedding = Array.from(result.data);
  return embedding;
}

export function isModelReady() {
  return modelReady;
}

export function getEmbeddingProvider() {
  return resolvedProvider;
}

// Warm up the model on first health check
let warmingUp = false;
export async function warmUp() {
  if (modelReady || warmingUp) return;
  warmingUp = true;
  try {
    await loadEmbeddingModel();
    if (resolvedProvider === 'transformers') {
      // Run a dummy embedding to finalize model initialization
      await embedText('warmup');
    }
  } finally {
    warmingUp = false;
  }
}

function embedTextFallback(text) {
  const vector = new Float32Array(EMBEDDING_DIMENSION);
  const normalized = normalizeText(text);
  const words = normalized
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !EMBEDDING_STOPWORDS.has(word));

  const features = [
    ...words.map(word => ({ key: `w:${word}`, weight: 1.6 })),
    ...buildWordBigrams(words).map(feature => ({ key: `b:${feature}`, weight: 1.25 })),
    ...buildCharacterTrigrams(normalized).map(feature => ({ key: `c:${feature}`, weight: 0.45 })),
  ];

  if (features.length === 0 && normalized) {
    for (const trigram of buildCharacterTrigrams(normalized, true)) {
      features.push({ key: `c:${trigram}`, weight: 0.45 });
    }
  }

  for (const feature of features) {
    const bucket = hashFeature(feature.key) % EMBEDDING_DIMENSION;
    const sign = (hashFeature(`${feature.key}:sign`) & 1) === 0 ? 1 : -1;
    vector[bucket] += feature.weight * sign;
  }

  return normalizeVector(Array.from(vector));
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildWordBigrams(words) {
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i += 1) {
    bigrams.push(`${words[i]}_${words[i + 1]}`);
  }
  return bigrams;
}

function buildCharacterTrigrams(text, pad = false) {
  const source = pad ? `  ${text}  ` : text;
  const compact = pad
    ? source.replace(/\s+/g, ' ')
    : source.replace(/\s+/g, ' ').trim();
  const trigrams = [];
  for (let i = 0; i < compact.length - 2; i += 1) {
    trigrams.push(compact.slice(i, i + 3));
  }
  return trigrams;
}

function hashFeature(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeVector(vector) {
  let norm = 0;
  for (const value of vector) {
    norm += value * value;
  }
  if (norm === 0) {
    return vector;
  }
  const magnitude = Math.sqrt(norm);
  return vector.map(value => value / magnitude);
}
