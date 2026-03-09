export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const RETRY = {
  DEFAULT_RETRIES: 3,
  DEFAULT_DELAY: 1000,
} as const;

export const TIMEOUTS = {
  API_REQUEST: 30000,
  TOAST_DURATION: 3000,
  ERROR_RELOAD_DELAY: 2000,
  CHUNK_ERROR_RELOAD: 1500,
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ROLE: 'role',
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

export const TOKEN = {
  EXPIRY_BUFFER_SECONDS: 300,
} as const;
