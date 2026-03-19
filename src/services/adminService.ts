import { nestClient } from '../api/axiosInstance';
import { ADMIN_INTERVIEW_THUMBNAILS_ENDPOINTS, BILLING_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  AdminDashboardData,
  AdminUsersResponse,
  AdminUpdateTierResponse,
} from '../types/admin';

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
