import { nestClient } from '../api/axiosInstance';
import { SESSION_ENDPOINTS } from '../constants/apiEndpoints';
import type { UserSession } from '../types/account';

export async function listSessions(): Promise<UserSession[]> {
  const res = await nestClient.get<UserSession[]>(SESSION_ENDPOINTS.LIST);
  return res.data;
}

export async function revokeSession(id: string): Promise<void> {
  await nestClient.delete(SESSION_ENDPOINTS.REVOKE(id));
}

export async function revokeOtherSessions(): Promise<void> {
  await nestClient.delete(SESSION_ENDPOINTS.REVOKE_OTHERS);
}
