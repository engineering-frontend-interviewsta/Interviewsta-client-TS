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
  /** Resume: Nest holds one SSE to FastAPI (~125s max); client must wait longer than default 30s. */
  RESUME_ANALYSIS_MS: 180000,
  TOAST_DURATION: 3000,
  ERROR_RELOAD_DELAY: 2000,
  CHUNK_ERROR_RELOAD: 1500,
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ROLE: 'role',
  INTERVIEW_ACCESS_TOKEN: 'interview_access_token',
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

export const TOKEN = {
  EXPIRY_BUFFER_SECONDS: 300,
} as const;

export const PLAN_TIERS = {
  FREE:     { tier: 0, slug: 'free',         name: 'Free',         credits: 4,   priceInr: 0,    priceDisplay: 'Free'    },
  PRO:      { tier: 1, slug: 'pro',          name: 'Pro',          credits: 40,  priceInr: 1660, priceDisplay: '₹1660/mo' },
  PRO_PLUS: { tier: 2, slug: 'pro-plus',     name: 'Pro+',         credits: 100, priceInr: 2499, priceDisplay: '₹2499/mo'},
  ORG:      { tier: 3, slug: 'organisation', name: 'Organization', credits: -1,  priceInr: -1,   priceDisplay: 'Custom'  },
  DEV:      { tier: 4, slug: 'developer',    name: 'Developer',    credits: -1,  priceInr: 0,    priceDisplay: 'Internal'},
} as const;

export const CREDIT_COSTS = {
  INTERVIEW: 2,
  RESUME: 1,
} as const;

/** Approximate INR per USD used for credit preview calculations */
export const USD_TO_INR = 83;

/** 2 credits per $1 spent (on-demand purchases) */
export const CREDITS_PER_DOLLAR = 2;

/** First free interview (0 credits): hard cap on interview length before upgrade prompt */
export const FREE_INTERVIEW_MAX_DURATION_SECONDS = 15 * 60;
