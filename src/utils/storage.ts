import { STORAGE_KEYS } from '../constants/appConstants';

let inMemoryToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryToken;
}

export function clearAccessToken(): void {
  inMemoryToken = null;
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
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}
