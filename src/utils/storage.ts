import { STORAGE_KEYS } from '../constants/appConstants';

let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

function readStoredAccessToken(): string | null {
  try {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;
  } catch {
    return null;
  }
}

function readStoredRefreshToken(): string | null {
  try {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      : null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  const stored = readStoredAccessToken();
  if (stored) inMemoryToken = stored;
  return stored;
}

export function clearAccessToken(): void {
  inMemoryToken = null;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  } catch {
    // ignore
  }
}

export function setRefreshToken(token: string | null): void {
  inMemoryRefreshToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
  } catch {
    // ignore
  }
}

export function getRefreshToken(): string | null {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  const stored = readStoredRefreshToken();
  if (stored) inMemoryRefreshToken = stored;
  return stored;
}

export function setRole(role: string | null): void {
  if (role != null) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ROLE);
  }
}

export function getRole(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ROLE);
}

export function clearAuthStorage(): void {
  inMemoryToken = null;
  inMemoryRefreshToken = null;
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

// --- Interview access token (JWT for interview stream / FastAPI) ---
// Persisted in sessionStorage so it survives navigation to the interview interface.

let interviewAccessToken: string | null = null;

function readStoredInterviewToken(): string | null {
  try {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.INTERVIEW_ACCESS_TOKEN)
      : null;
  } catch {
    return null;
  }
}

export function setInterviewAccessToken(token: string | null): void {
  interviewAccessToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.INTERVIEW_ACCESS_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.INTERVIEW_ACCESS_TOKEN);
      }
    }
  } catch {
    // ignore
  }
}

export function getInterviewAccessToken(): string | null {
  if (interviewAccessToken) return interviewAccessToken;
  const stored = readStoredInterviewToken();
  if (stored) interviewAccessToken = stored;
  return stored;
}

export function clearInterviewAccessToken(): void {
  interviewAccessToken = null;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.INTERVIEW_ACCESS_TOKEN);
    }
  } catch {
    // ignore
  }
}
