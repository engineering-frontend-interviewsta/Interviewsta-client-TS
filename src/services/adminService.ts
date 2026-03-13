import { djangoClient } from '../api/axiosInstance';
import { BILLING_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  AdminDashboardData,
  AdminUsersResponse,
  AdminUpdateTierResponse,
} from '../types/admin';

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await djangoClient.get(BILLING_ENDPOINTS.ADMIN_DASHBOARD);
  return res.data as AdminDashboardData;
}

export async function getAdminUsers(page: number): Promise<AdminUsersResponse> {
  const res = await djangoClient.get(BILLING_ENDPOINTS.ADMIN_USERS(page));
  return res.data as AdminUsersResponse;
}

export async function updateUserTier(
  userId: number,
  tier: number
): Promise<AdminUpdateTierResponse> {
  const res = await djangoClient.patch(BILLING_ENDPOINTS.ADMIN_USER_TIER(userId), { tier });
  return res.data as AdminUpdateTierResponse;
}

export async function deleteUser(userId: number): Promise<void> {
  await djangoClient.delete(BILLING_ENDPOINTS.ADMIN_USER_DELETE(userId));
}
