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

/** Overall is always set when present; sub-dimensions may be omitted or only partially filled by the pipeline. */
export interface CommunicationMetrics {
  overall: number;
  clarity?: number;
  fluency?: number;
  responseRelevance?: number;
  structure?: number;
}

export interface GrammarMetrics {
  overall: number;
  grammarCorrectness?: number;
  sentenceConstruction?: number;
  vocabularyControl?: number;
  conciseness?: number;
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
  /** Rich video telemetry + AI narrative (when backend attaches it to stored feedback). */
  telemetryData?: FeedbackTelemetryData | null;
}

/** Video telemetry timeline bucket (duration = cumulative seconds since session start). */
export interface FeedbackTelemetrySpeechSample {
  currentWPM?: number;
  currentWpm?: number;
  deadPauses?: number;
  totalWords?: number;
  fillerCount?: number;
  segmentCount?: number;
  currIntSegmentWpm?: number[];
  currIntSegmentWords?: number[];
  currIntSegmentCounts?: number;
}

export interface FeedbackTelemetryTimelineEntry {
  time?: string;
  speech?: FeedbackTelemetrySpeechSample;
  /** Cumulative seconds of analysed session so far. */
  duration: number;
  verdicts?: {
    issues?: Array<{
      title?: string;
      detail?: string;
      impact?: string;
      category?: string;
    }>;
  };
  faceTouchDelta?: number;
  hairTouchDelta?: number;
  stressEventsDelta?: number;
  browRaiseLipCompression?: { browRaise?: number; lipCompression?: number };
}

export interface FeedbackTelemetryStrength {
  title?: string;
  detail?: string;
  source?: string;
}

export interface FeedbackTelemetryGap {
  title?: string;
  detail?: string;
  source?: string;
}

export interface FeedbackTelemetryActionItem {
  rank?: number;
  title?: string;
  detail?: string;
  urgency?: string;
  category?: string;
}

export interface FeedbackTelemetryHireProbability {
  verdict?: string;
  breakdown?: {
    speech?: number;
    presence?: number;
    environment?: number;
    technical?: number;
  };
  narrative?: string;
  probability?: number;
  impact_items?: Array<Record<string, unknown>>;
}

export interface FeedbackTelemetryPresenceDimension {
  name?: string;
  score?: number;
  stats?: Record<string, number>;
  narrative?: string;
}

export interface FeedbackTelemetryEnvironmentItem {
  label?: string;
  note?: string;
  score?: number;
  verdict?: string;
  deviceKind?: string | null;
}

export interface FeedbackTelemetryEnvironmentDimension {
  items?: FeedbackTelemetryEnvironmentItem[];
  overall_score?: number;
  critical_issues?: unknown[];
}

export interface FeedbackTelemetrySpeechDimension {
  score?: number;
  avg_wpm?: number;
  narrative?: string;
  dead_pauses?: number;
  top_fillers?: Array<{ word?: string; count?: number } | Record<string, unknown>>;
  fillers_per_minute?: number;
  transcription_conf?: number;
}

export interface FeedbackTelemetryData {
  session_id?: string;
  overall_score?: number;
  timeline?: FeedbackTelemetryTimelineEntry[];
  strengths?: FeedbackTelemetryStrength[];
  gaps?: FeedbackTelemetryGap[];
  action_plan?: FeedbackTelemetryActionItem[];
  hire_probability?: FeedbackTelemetryHireProbability;
  speech_dimension?: FeedbackTelemetrySpeechDimension;
  presence_dimensions?: FeedbackTelemetryPresenceDimension[];
  environment_dimension?: FeedbackTelemetryEnvironmentDimension;
  [key: string]: unknown;
}

/** Raw API response from /interview-feedback/ */
export interface SessionHistoryResponse {
  message?: string;
  feedback?: InterviewFeedback;
}
