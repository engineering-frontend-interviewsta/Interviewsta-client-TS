export const SERVICE_HEADERS = {
  JSON: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  TEXT_PLAIN: {
    Accept: 'text/plain',
    'Content-Type': 'application/json',
  },
} as const;

export interface NormalizedResponse<T = unknown> {
  isSuccess: boolean;
  msg: string;
  data: T;
}

export function normalizeResponse<T = unknown>(
  response: { data?: { success?: boolean; message?: string; data?: T }; status: number },
  defaultMessage = 'Operation completed successfully'
): NormalizedResponse<T> {
  const data = response.data;
  const isSuccess = data?.success !== false && response.status === 200;
  const msg = (data && 'message' in data ? data.message : undefined) || defaultMessage;
  const payload = (data && 'data' in data ? data.data : data) as T;
  return {
    isSuccess,
    msg: typeof msg === 'string' ? msg : defaultMessage,
    data: payload ?? ({} as T),
  };
}

export function safeParseInt(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export function safeParseFloat(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export function safeString(value: unknown, defaultValue = ''): string {
  return value != null ? String(value) : defaultValue;
}
