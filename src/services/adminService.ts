import { nestClient } from '../api/axiosInstance';
import { BILLING_ENDPOINTS, USER_ADMIN_ENDPOINTS } from '../constants/apiEndpoints';
import { ADMIN_INTERVIEW_THUMBNAILS_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  AdminDashboardData,
  AdminUsersResponse,
  AdminUpdateTierResponse,
} from '../types/admin';
import type { AdminUsersPage, AdminUserView, AdminPlatformStats } from '../types/account';

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await nestClient.get(BILLING_ENDPOINTS.ADMIN_DASHBOARD);
  return res.data as AdminDashboardData;
}

export async function getAdminUsers(page: number): Promise<AdminUsersResponse> {
  const res = await nestClient.get(BILLING_ENDPOINTS.ADMIN_USERS(page));
  return res.data as AdminUsersResponse;
}

export async function updateUserTier(
  userId: number,
  tier: number
): Promise<AdminUpdateTierResponse> {
  const res = await nestClient.patch(BILLING_ENDPOINTS.ADMIN_USER_TIER(userId), { tier });
  return res.data as AdminUpdateTierResponse;
}

export async function deleteUser(userId: number): Promise<void> {
  await nestClient.delete(BILLING_ENDPOINTS.ADMIN_USER_DELETE(userId));
}

// ─── NestJS admin endpoints ────────────────────────────────────────────────

export async function getNestAdminUsers(page: number, limit = 20): Promise<AdminUsersPage> {
  const res = await nestClient.get(USER_ADMIN_ENDPOINTS.USERS(page, limit));
  return res.data as AdminUsersPage;
}

export async function updateNestUserRole(userId: string, role: string): Promise<AdminUserView> {
  const res = await nestClient.patch(USER_ADMIN_ENDPOINTS.UPDATE_ROLE(userId), { role });
  return res.data as AdminUserView;
}

export async function deleteNestUser(userId: string): Promise<void> {
  await nestClient.delete(USER_ADMIN_ENDPOINTS.DELETE_USER(userId));
}

export async function getNestAdminStats(): Promise<AdminPlatformStats> {
  const res = await nestClient.get(USER_ADMIN_ENDPOINTS.STATS);
  return res.data as AdminPlatformStats;
}

export async function uploadInterviewThumbnail(interviewTestId: string, file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const res = await nestClient.post(
    ADMIN_INTERVIEW_THUMBNAILS_ENDPOINTS.UPLOAD_THUMBNAIL(interviewTestId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  const data = res.data as { thumbnailUrl?: string | null };
  return data.thumbnailUrl ?? null;
}
