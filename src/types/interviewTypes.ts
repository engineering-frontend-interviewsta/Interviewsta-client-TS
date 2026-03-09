/**
 * Single interview option (from JSON or role-based list).
 * Matches backend interview_type_id and payload expectations.
 */
export interface InterviewTypeEntry {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  questions: number | null;
  duration: number;
  description?: string;
  topics?: string[];
  company?: string | null;
  subject?: string | null;
  interview_mode?: string;
  is_active?: boolean;
  /** Present for role-wise entries */
  role?: string;
}
