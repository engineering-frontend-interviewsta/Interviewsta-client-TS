import { nestClient } from '../api/axiosInstance';
import { BILLING_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  LatestSubscriptionResult,
  FeedbackAccessResult,
  PaginatedTransactionsResult,
  PlanStatus,
} from '../types/account';

export async function getBillingAccount(): Promise<LatestSubscriptionResult> {
  const res = await nestClient.get(BILLING_ENDPOINTS.ACCOUNT);
  return (res.data ?? { subscription: null, hasAccess: false }) as LatestSubscriptionResult;
}

export async function getPlanStatus(): Promise<PlanStatus | null> {
  const res = await nestClient.get(BILLING_ENDPOINTS.PLAN_STATUS).catch(() => ({ data: null }));
  return (res?.data as PlanStatus | null) ?? null;
}

export async function getFeedbackAccess(): Promise<FeedbackAccessResult> {
  const res = await nestClient.get(BILLING_ENDPOINTS.FEEDBACK_ACCESS).catch(() => ({ data: {} }));
  return (res?.data ?? {}) as FeedbackAccessResult;
}

export async function getTransactions(
  page: number
): Promise<PaginatedTransactionsResult> {
  const res = await nestClient.get(BILLING_ENDPOINTS.TRANSACTIONS(page));
  return (res.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }) as PaginatedTransactionsResult;
}
