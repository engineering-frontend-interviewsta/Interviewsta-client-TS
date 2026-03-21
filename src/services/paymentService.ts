import { nestClient } from '../api/axiosInstance';
import { PAYMENT_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  CreateOrderPayload,
  RazorpayOrderResult,
  VerifyPaymentPayload,
  VerifyPaymentResult,
  PlanTierInfo,
} from '../types/account';

export async function getPaymentConfig(): Promise<{ keyId: string }> {
  const res = await nestClient.get(PAYMENT_ENDPOINTS.CONFIG);
  return res.data as { keyId: string };
}

export async function getPaymentPlans(): Promise<PlanTierInfo[]> {
  const res = await nestClient.get(PAYMENT_ENDPOINTS.PLANS);
  return res.data as PlanTierInfo[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<RazorpayOrderResult> {
  const res = await nestClient.post(PAYMENT_ENDPOINTS.CREATE_ORDER, payload);
  return res.data as RazorpayOrderResult;
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
  const res = await nestClient.post(PAYMENT_ENDPOINTS.VERIFY, payload);
  return res.data as VerifyPaymentResult;
}
