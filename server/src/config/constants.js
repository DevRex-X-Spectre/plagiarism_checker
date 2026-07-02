export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

export const JWT_EXPIRY = '7d';
export const RESET_TOKEN_EXPIRY_HOURS = 1;

export const SIMILARITY = {
  DEFAULT_THRESHOLD: 0.5,
  MIN_THRESHOLD: 0.3,
  MAX_THRESHOLD: 0.9,
  HIGH_FLAG: 0.8,
  MODERATE_FLAG: 0.5,
};

export const VALID_ROLES = Object.values(ROLES);
export const MIN_PASSWORD_LENGTH = 8;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const EMBEDDING_DIMENSION = 384; // all-MiniLM-L6-v2 output dimension
