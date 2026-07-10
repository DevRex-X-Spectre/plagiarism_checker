import { pipeline, env } from '@huggingface/transformers';

let embeddingPipeline = null;
let modelReady = false;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

// Skip local cache check in production to use CDN
if (process.env.NODE_ENV === 'production') {
  env.allowLocalModels = false;
  env.useBrowserCache = false;
}

export async function loadEmbeddingModel() {
  if (embeddingPipeline) return embeddingPipeline;

  console.log(`Loading embedding model: ${MODEL_NAME}...`);

  try {
    embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
      dtype: 'fp32',
    });
    modelReady = true;
    console.log('Embedding model loaded successfully');
    return embeddingPipeline;
  } catch (err) {
    console.error('Failed to load embedding model:', err.message);
    throw err;
  }
}

export async function embedText(text) {
  if (!embeddingPipeline) {
    await loadEmbeddingModel();
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

// Warm up the model on first health check
let warmingUp = false;
export async function warmUp() {
  if (modelReady || warmingUp) return;
  warmingUp = true;
  try {
    await loadEmbeddingModel();
    // Run a dummy embedding to finalize model initialization
    await embedText('warmup');
  } finally {
    warmingUp = false;
  }
}
