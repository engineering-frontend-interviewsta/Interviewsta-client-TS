/** Video interview session history / feedback (get-session-history) */
export interface SessionHistoryResponse {
  status?: 'pending' | 'completed' | 'failed';
  overall_score?: number;
  detailed_scores?: Record<string, { score?: number; breakdown?: Record<string, number> }>;
  feedback_summary?: {
    strengths?: string[];
    areas_of_improvements?: string[];
  };
  interaction_log?: unknown[];
  interview_test_details?: Record<string, unknown> & { interview_mode?: string };
  speech_summary?: unknown;
  allScores?: unknown[];
}
