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

export interface CommunicationMetrics {
  overall: number;
  clarity: number;
  fluency: number;
  responseRelevance: number;
  structure: number;
}

export interface GrammarMetrics {
  overall: number;
  grammarCorrectness: number;
  sentenceConstruction: number;
  vocabularyControl: number;
  conciseness: number;
}

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
  /** Universal communication score across interview types (0-100). */
  communicationScore?: number;
  /** Universal grammar score across interview types (0-100). */
  grammarScore?: number;
  communicationMetrics?: CommunicationMetrics;
  grammarMetrics?: GrammarMetrics;
  duration?: string;
  savedAt?: string;
  updatedAt?: string;
}

/** Raw API response from /interview-feedback/ */
export interface SessionHistoryResponse {
  message?: string;
  feedback?: InterviewFeedback;
}
