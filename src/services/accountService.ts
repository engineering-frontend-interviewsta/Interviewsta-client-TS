import { nestClient } from '../api/axiosInstance';
import { BILLING_ENDPOINTS } from '../constants/apiEndpoints';
import type { BillingAccount, TransactionItem, PlanStatus } from '../types/account';

export async function getBillingAccount(): Promise<BillingAccount> {
  const res = await nestClient.get(BILLING_ENDPOINTS.ACCOUNT);
  return (res.data ?? {}) as BillingAccount;
}

export async function getPlanStatus(): Promise<PlanStatus | null> {
  const res = await nestClient.get(BILLING_ENDPOINTS.PLAN_STATUS).catch(() => ({ data: null }));
  return (res?.data as PlanStatus | null) ?? null;
}

export async function getFeedbackAccess(): Promise<{ can_access_full_feedback?: boolean; tier?: number }> {
  const res = await nestClient.get(BILLING_ENDPOINTS.FEEDBACK_ACCESS).catch(() => ({ data: {} }));
  return (res?.data ?? {}) as { can_access_full_feedback?: boolean; tier?: number };
}

export async function getTransactions(page: number): Promise<{ results?: TransactionItem[] }> {
  const res = await nestClient.get(BILLING_ENDPOINTS.TRANSACTIONS(page));
  return (res.data ?? {}) as { results?: TransactionItem[] };
}

export async function getApiKeys(): Promise<unknown[]> {
  const res = await nestClient.get(BILLING_ENDPOINTS.API_KEYS).catch(() => ({ data: [] }));
  const data = res?.data;
  return Array.isArray(data) ? data : [];
}

export async function createApiKey(label: string): Promise<unknown> {
  const res = await nestClient.post(BILLING_ENDPOINTS.API_KEYS, { label: label.trim() });
  return res.data;
}
