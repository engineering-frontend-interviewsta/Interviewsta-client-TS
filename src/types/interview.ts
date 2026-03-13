/** Interview type sent to backend */
export type InterviewType =
  | 'Technical'
  | 'HR'
  | 'Company'
  | 'Subject'
  | 'Case Study'
  | 'Coding'
  | 'Role-Based'
  | 'Communication'
  | 'Debate';

/** Result of POST /interview/start */
export interface StartInterviewResult {
  sessionId: string;
  taskId: string;
  status: 'pending' | 'queued';
  message?: string;
}

/** Result of GET /interview/start-status/:taskId */
export interface StartTaskStatusResult {
  status: string;
  result: unknown | null;
  error: string | null;
  progress: number;
}

/** Result of POST /interview/:sessionId/respond */
export interface SubmitResponseResult {
  taskId: string;
  status: string;
}

/** Communication interview: speaking phase payload (backend may use snake_case) */
export interface SpeakingPayload {
  instruction?: string;
  paragraph?: string;
}

/** Communication interview: comprehension payload */
export interface ComprehensionPayload {
  instruction?: string;
  question?: string;
  paragraph?: string;
}

/** Communication interview: single MCQ (question + options) */
export interface MCQPayload {
  instruction?: string;
  question?: string;
  options?: string[];
}

/** Single MCQ result (correct answer, user answer) */
export interface MCQResultItem {
  question_number?: number;
  question?: string;
  user_answer?: string;
  correct_answer?: string;
}

/** Backend respond-status can return interview_ai_response with camelCase keys */
export interface InterviewAIResponsePayload {
  message?: string;
  audio_base64?: string;
  last_node?: string;
  /** camelCase from FastAPI route */
  currentspeaking?: SpeakingPayload;
  speakingfeedback?: string;
  currentcomprehension?: ComprehensionPayload;
  comprehensionfeedback?: string;
  currentmcq?: MCQPayload;
  mcqfeedback?: string;
  mcq_results?: MCQResultItem[];
}

/** Result of GET respond-status (task completion); backend may send result + interview_ai_response */
export interface RespondTaskResult {
  status?: string;
  result?: { message?: string };
  interview_ai_response?: InterviewAIResponsePayload;
  interview_transcript?: string;
  error?: string;
}

/** AI response shape in status poll and SSE */
export interface AIResponseData {
  message?: string;
  audioBase64?: string;
  questionNumber?: number;
  totalQuestions?: number;
  lastNode?: string;
}

/** Communication phase state for UI (normalized from backend) */
export interface CommunicationData {
  speaking: { instruction?: string; paragraph?: string } | null;
  speakingFeedback: string | null;
  comprehension: { instruction?: string; question?: string } | null;
  comprehensionFeedback: string | null;
  mcq: MCQPayload | null;
  mcqCount: number;
  mcqFeedback: string | null;
  mcqResults: MCQResultItem[] | null;
}

/** Result of GET /interview/:sessionId/status */
export interface PollStatusResult {
  status: string;
  aiResponse: AIResponseData | null;
  transcript: unknown;
  isComplete: boolean;
  lastNode: string | null;
  error: string | null;
}

/** Callbacks for SSE stream */
export interface InterviewStreamCallbacks {
  onStatusUpdate?: (status: string) => void;
  onAIResponse?: (data: AIResponseData) => void;
  onTranscript?: (transcript: string) => void;
  onComplete?: (data: unknown) => void;
  onError?: (message: string) => void;
  onQualityWarning?: (data: { type?: string; message?: string }) => void;
  onConnectionIssue?: (data: { type: string; message: string; attempt?: number; maxAttempts?: number }) => void;
}
