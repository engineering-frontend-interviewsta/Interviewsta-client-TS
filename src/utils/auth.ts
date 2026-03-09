import { getAccessToken } from './storage';

/**
 * Returns the current access token for API calls that need it (e.g. SSE with query param).
 * @throws Error if user is not authenticated
 */
export function getAuthToken(): string {
  const token = getAccessToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  return token;
}
