export interface BillingAccount {
  plan?: string;
  credits_remaining?: number;
  [key: string]: unknown;
}

export interface TransactionItem {
  id: number;
  amount?: number;
  created_at?: string;
  status?: string;
  [key: string]: unknown;
}
