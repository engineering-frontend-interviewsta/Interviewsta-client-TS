/** Legacy snake_case user (old billing/account) */
export interface AccountUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  date_joined?: string;
}

/** Legacy snake_case plan (old billing/account) */
export interface AccountPlan {
  tier?: number;
  tier_name?: string;
  billing_cycle?: 'monthly' | 'yearly';
  total_credits?: number;
  remaining_credits?: number;
  used_interview_credits?: number;
  used_resume_credits?: number;
  interviews_equivalent?: number;
  month_reset_date?: string | null;
}

/** Legacy shape (kept for compatibility); new API returns LatestSubscriptionResult */
export interface BillingAccount {
  user?: AccountUser;
  account?: AccountPlan;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export interface SubscriptionView {
  id: string;
  userId: string;
  tierId: string;
  tierName: string;
  tierSlug: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currencyCode: string;
  amountCents: number;
  startedAt: string;
  endsAt: string;
  cancelledAt: string | null;
}

/** User in camelCase (customer-management/subscription/me) */
export interface SubscriptionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  dateJoined?: string;
}

/** Account/plan in camelCase (customer-management/subscription/me) */
export interface SubscriptionAccount {
  tier?: number;
  tierName?: string;
  billingCycle?: 'monthly' | 'yearly';
  totalCredits?: number;
  remainingCredits?: number;
  usedInterviewCredits?: number;
  usedResumeCredits?: number;
  interviewsEquivalent?: number;
  monthResetDate?: string | null;
}

export interface LatestSubscriptionResult {
  subscription: SubscriptionView | null;
  hasAccess: boolean;
  user?: SubscriptionUser;
  account?: SubscriptionAccount;
}

export interface FeedbackAccessResult {
  canAccessFullFeedback?: boolean;
  tier?: number;
  tierName?: string;
}

/** Transaction type / status from backend (extend as needed) */
export type TransactionType = string;
export type TransactionStatus = string;

export interface TransactionLogView {
  id: string;
  userId: string;
  subscriptionId: string | null;
  type: TransactionType;
  amountCents: number;
  currencyCode: string;
  status: TransactionStatus;
  externalId: string | null;
  createdAt: string;
}

/** Billing-transactions-style item (camelCase, for backward compat) */
export interface TransactionResultItem {
  id: string;
  amount?: number;
  createdAt?: string;
  status?: string;
  description?: string;
  currency?: string;
}

export interface PaginatedTransactionsResult {
  data: TransactionLogView[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results?: TransactionResultItem[];
}

/** @deprecated Prefer TransactionResultItem or TransactionLogView */
export interface TransactionItem {
  id: number;
  amount?: number;
  created_at?: string;
  status?: string;
  description?: string;
  currency?: string;
}

export interface PlanStatus {
  has_time_limit?: boolean;
  tier?: number;
}

// ─── Payment / Razorpay ────────────────────────────────────────────────────

export type OrderType = 'plan_upgrade' | 'credit_purchase';

export interface CreateOrderPayload {
  type: OrderType;
  tierId?: string;
  amountPaise?: number;
  billingInterval?: 'monthly' | 'annual';
}

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  type: OrderType;
  tierId?: string;
  billingInterval?: 'monthly' | 'annual';
  amountPaise?: number;
}

export interface VerifyPaymentResult {
  success: boolean;
  creditsAdded?: number;
}

export interface PlanTierInfo {
  id: string;
  name: string;
  slug: string;
  credits: number;
  monthlyPaise: number;
  annualPaise: number;
}

// ─── Admin user management (NestJS /user/admin/*) ─────────────────────────

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isWhitelisted: boolean;
  interviewCount: number;
  createdAt: string;
}

export interface AdminUsersPage {
  data: AdminUserView[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalAdmins: number;
  totalDevelopers: number;
  totalInterviews: number;
}

// ─── Active sessions ───────────────────────────────────────────────────────

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  createdAt: string;
  lastUsedAt: string;
}
