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

/** Result of GET respond-status (task completion); backend may send result + interview_ai_response */
export interface RespondTaskResult {
  status?: string;
  result?: { message?: string };
  interview_ai_response?: {
    message?: string;
    audio_base64?: string;
    last_node?: string;
  };
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
