/** Video interview session history / feedback (get-session-history) */
export interface SessionHistoryResponse {
  status?: 'pending' | 'completed' | 'failed';
  overall_score?: number;
  detailed_scores?: Record<string, { score?: number; breakdown?: Record<string, number> }>;
  /** Optional per-category percentiles, when backend provides them */
  sub_scores?: Record<string, { percentile?: number; total_participants?: number }>;
  feedback_summary?: {
    strengths?: string[];
    areas_of_improvements?: string[];
    areas_of_improvement?: string[];
  };
  skills_scores?: { name: string; score: number }[];
  interaction_log?: {
    question?: string;
    answer?: string;
    timestamp?: string;
  }[];
  interview_test_details?: Record<string, unknown> & { interview_mode?: string };
  speech_summary?: unknown;
  /** Optional soft-skill summary (e.g. confidence score) */
  soft_skill_summary?: {
    confidence?: number;
    gaze?: number;
    nervousness?: number;
    engagement?: number;
    distraction?: number;
    [key: string]: unknown;
  };
  allScores?: {
    percentile?: number;
    total_participants?: number;
    all_scores?: number[];
  };
  big5_profile?: {
    A?: number;
    C?: number;
    E?: number;
    N?: number;
    O?: number;
  };
  big5_features?: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
}
