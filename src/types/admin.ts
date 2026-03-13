/** Admin dashboard API response */
export interface AdminDashboardData {
  overview: {
    total_users: number;
    total_interviews: number;
    total_resumes: number;
    avg_score: number;
  };
  users_by_tier: Array<{ tier: number; tier_name: string; count: number }>;
  interview_type_breakdown: Array<{ type: string; count: number }>;
  monthly_trend: Array<{ month: string; sessions: number; avg_score: number }>;
  top_performers: AdminPerformer[];
  bottom_performers: AdminPerformer[];
}

export interface AdminPerformer {
  id: number;
  name: string;
  email: string;
  avg_score: number;
  sessions: number;
}

/** Single user in admin user list */
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  date_joined: string;
  app_role: 'student' | 'teacher' | 'admin';
  interview_count: number;
  tier: number;
  tier_name: string;
  total_credits: number;
  remaining_credits: number;
  used_credits: number;
}

/** Paginated admin users response */
export interface AdminUsersResponse {
  count: number;
  results: AdminUser[];
}

/** Response after updating user tier */
export interface AdminUpdateTierResponse {
  id: number;
  tier: number;
  tier_name: string;
  total_credits: number;
  remaining_credits: number;
}
