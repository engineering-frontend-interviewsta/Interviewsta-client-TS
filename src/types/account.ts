export interface AccountUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  date_joined?: string;
}

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

/** Shape returned by billing/account/ */
export interface BillingAccount {
  user?: AccountUser;
  account?: AccountPlan;
}

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
