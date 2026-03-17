export interface FeedbackInteractionLog {
  question?: string;
  answer?: string;
  timestamp?: string;
}

export interface FeedbackInteractionStatusLog {
  status?: string;
  comment?: string;
}

export type FeedbackItems = Record<string, Record<string, number>>;

/** Core interview feedback payload returned under `feedback` */
export interface InterviewFeedback {
  id: string;
  sessionId: string;
  userId: string;
  interviewTestId: string;
  strengths?: string[];
  areasForImprovements?: string[];
  interactionLogs?: FeedbackInteractionLog[];
  interactionStatusLogs?: FeedbackInteractionStatusLog[];
  items?: FeedbackItems;
  /** Pre-computed score per sleeve (sleeve name → score). Use when present. */
  sleeveScore?: Record<string, number>;
  /** Overall score (may be -1 when not computed) */
  overallScore?: number;
  duration?: string;
  savedAt?: string;
  updatedAt?: string;
}

/** Raw API response from /interview-feedback/ */
export interface SessionHistoryResponse {
  message?: string;
  feedback?: InterviewFeedback;
}
