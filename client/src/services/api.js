import axios from 'axios';

function normalizeApiBaseUrl(value) {
  const baseUrl = (value || '/api').replace(/\/$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const API_HEALTH_URL = API_BASE_URL.replace(/\/api\/?$/, '/health');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);
const RETRYABLE_CODES = new Set(['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT']);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getNetworkMessage(error) {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The server took too long to respond. Please try again.';
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Unable to reach the server. Check your connection or try again in a moment.';
  }

  return error.response?.data?.error || error.message || 'Something went wrong';
}

export async function warmUpApi() {
  try {
    await axios.get(API_HEALTH_URL, {
      timeout: 30000,
      withCredentials: false,
      headers: { Accept: 'application/json' },
    });
  } catch {
    // The next API request will still surface the real error to the user.
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config || {};
    const method = config.method?.toLowerCase();
    const isRetryableMethod = RETRYABLE_METHODS.has(method);
    const isRetryableError = RETRYABLE_CODES.has(error.code) || [502, 503, 504].includes(error.response?.status);
    const retryCount = config.__retryCount || 0;

    if (isRetryableMethod && isRetryableError && retryCount < 2) {
      config.__retryCount = retryCount + 1;
      await delay(500 * config.__retryCount);
      return api(config);
    }

    const message = getNetworkMessage(error);
    return Promise.reject(new Error(message));
  }
);

export default api;
