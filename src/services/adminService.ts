import { djangoClient } from '../api/axiosInstance';
import { BILLING_ENDPOINTS } from '../constants/apiEndpoints';

export async function getAdminDashboard(): Promise<unknown> {
  const res = await djangoClient.get(BILLING_ENDPOINTS.ADMIN_DASHBOARD);
  return res.data;
}

export async function getAdminUsers(page: number): Promise<{ results?: unknown[]; count?: number }> {
  const res = await djangoClient.get(BILLING_ENDPOINTS.ADMIN_USERS(page));
  return (res.data ?? {}) as { results?: unknown[]; count?: number };
}
