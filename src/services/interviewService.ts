import Config from '../config';
import { fastApiClient } from '../api/axiosInstance';
import { INTERVIEW_ENDPOINTS } from '../constants/apiEndpoints';
import { getAuthToken } from '../utils/auth';
import type {
  StartInterviewResult,
  StartTaskStatusResult,
  SubmitResponseResult,
  PollStatusResult,
  AIResponseData,
  InterviewStreamCallbacks,
} from '../types/interview';

/**
 * Start a new interview session.
 */
export async function startInterview(params: {
  interviewType: string;
  userId: string;
  payload: Record<string, unknown>;
  sessionId?: string;
}): Promise<StartInterviewResult> {
  const finalSessionId = params.sessionId ?? crypto.randomUUID();
  const response = await fastApiClient.post(INTERVIEW_ENDPOINTS.START, {
    interview_type: params.interviewType,
    session_id: finalSessionId,
    user_id: params.userId,
    payload: params.payload ?? {},
  });
  const data = response.data as {
    session_id?: string;
    task_id?: string;
    status?: string;
    message?: string;
  };
  return {
    sessionId: data.session_id ?? finalSessionId,
    taskId: data.task_id ?? '',
    status: (data.status as 'pending' | 'queued') ?? 'pending',
    message: data.message,
  };
}

/**
 * Poll status of the start interview task.
 */
export async function getStartTaskStatus(taskId: string): Promise<StartTaskStatusResult> {
  const response = await fastApiClient.get(INTERVIEW_ENDPOINTS.START_STATUS(taskId));
  const data = response.data as { status?: string; result?: unknown; error?: string; progress?: number };
  return {
    status: data.status ?? 'processing',
    result: data.result ?? null,
    error: data.error ?? null,
    progress: data.progress ?? 0,
  };
}

/**
 * Poll status of the respond task.
 */
export async function getRespondTaskStatus(
  sessionId: string,
  taskId: string
): Promise<{ taskId?: string; sessionId?: string; status?: string; result?: unknown; error?: string }> {
  const response = await fastApiClient.get(INTERVIEW_ENDPOINTS.RESPOND_STATUS(sessionId, taskId));
  return response.data as object;
}

/**
 * Submit user response (text, audio, or code).
 */
export async function submitResponse(params: {
  sessionId: string;
  textResponse?: string | null;
  audioData?: string | null;
  codeInput?: string | null;
  sampleRate?: number;
}): Promise<SubmitResponseResult> {
  const body: Record<string, unknown> = {};
  if (params.textResponse != null && params.textResponse !== '') body.text_response = params.textResponse;
  if (params.audioData != null && params.audioData !== '') body.audio_data = params.audioData;
  if (params.codeInput != null && params.codeInput !== '') body.code_input = params.codeInput;
  if (body.audio_data && params.sampleRate != null) body.sample_rate = params.sampleRate;

  const response = await fastApiClient.post(INTERVIEW_ENDPOINTS.RESPOND(params.sessionId), body);
  const data = response.data as { task_id?: string; status?: string };
  return {
    taskId: data.task_id ?? '',
    status: data.status ?? 'processing',
  };
}

/**
 * Poll for interview status and AI response.
 */
export async function pollInterviewStatus(sessionId: string): Promise<PollStatusResult> {
  const response = await fastApiClient.get(INTERVIEW_ENDPOINTS.STATUS(sessionId));
  const data = response.data as {
    status?: string;
    ai_response?: {
      message?: string;
      audio_base64?: string;
      question_number?: number;
      total_questions?: number;
      last_node?: string;
    };
    transcript?: unknown;
    is_complete?: boolean;
    last_node?: string;
    error?: string;
  };
  const ar = data.ai_response;
  return {
    status: data.status ?? 'waiting',
    aiResponse: ar
      ? {
          message: ar.message,
          audioBase64: ar.audio_base64,
          questionNumber: ar.question_number,
          totalQuestions: ar.total_questions,
          lastNode: ar.last_node,
        }
      : null,
    transcript: data.transcript,
    isComplete: data.is_complete ?? false,
    lastNode: data.last_node ?? null,
    error: data.error ?? null,
  };
}

/**
 * Post video telemetry. Does not throw so telemetry failure does not break the interview.
 */
export async function postVideoTelemetry(
  sessionId: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await fastApiClient.post(INTERVIEW_ENDPOINTS.VIDEO_TELEMETRY(sessionId), payload);
  } catch {
    // Telemetry is non-critical
  }
}

/**
 * Submit video quality metrics.
 */
export async function submitVideoQuality(
  sessionId: string,
  metrics: Record<string, unknown>
): Promise<void> {
  try {
    await fastApiClient.post(INTERVIEW_ENDPOINTS.VIDEO_QUALITY(sessionId), metrics);
  } catch {
    // Non-critical
  }
}

/**
 * End interview session.
 */
export async function endInterview(params: {
  sessionId: string;
  interviewType: string;
  interviewTestId?: number;
  duration: number;
  sessionFinished?: boolean;
}): Promise<unknown> {
  const response = await fastApiClient.post(INTERVIEW_ENDPOINTS.END, {
    session_id: params.sessionId,
    interview_type: params.interviewType,
    interview_test_id: params.interviewTestId,
    duration: String(params.duration),
    session_finished: params.sessionFinished ?? false,
  });
  return response.data;
}

/**
 * Get feedback generation task status.
 */
export async function getInterviewFeedbackStatus(taskId: string): Promise<{
  taskId: string;
  sessionId: string;
  status: string;
  progress: number;
  result: unknown;
  error: string | null;
}> {
  const response = await fastApiClient.get(INTERVIEW_ENDPOINTS.FEEDBACK_STATUS(taskId));
  const data = response.data as {
    task_id?: string;
    session_id?: string;
    status?: string;
    progress?: number;
    result?: unknown;
    error?: string;
  };
  return {
    taskId: data.task_id ?? '',
    sessionId: data.session_id ?? '',
    status: data.status ?? 'queued',
    progress: data.progress ?? 0,
    result: data.result,
    error: data.error ?? null,
  };
}

/**
 * Build SSE stream URL with token (Config is the only place that knows base URL).
 */
function getStreamUrl(sessionId: string, token: string): string {
  const base = Config.FASTAPI_BASE_URL;
  const path = INTERVIEW_ENDPOINTS.STREAM(sessionId);
  const full = base.endsWith('/') ? `${base.slice(0, -1)}${path}` : `${base}${path}`;
  return `${full}?token=${encodeURIComponent(token)}`;
}

function processAIResponse(data: {
  message?: string;
  audio_base64?: string;
  audio?: string;
  audioBase64?: string;
  question_number?: number;
  total_questions?: number;
  last_node?: string;
}): AIResponseData {
  const audioBase64 = data.audio_base64 ?? data.audio ?? data.audioBase64;
  return {
    message: data.message,
    audioBase64,
    questionNumber: data.question_number,
    totalQuestions: data.total_questions,
    lastNode: data.last_node,
  };
}

/**
 * Connect to interview SSE stream. Returns { close } to disconnect.
 */
export function connectToInterviewStream(
  sessionId: string,
  callbacks: InterviewStreamCallbacks
): { close: () => void } {
  const token = getAuthToken();
  const url = getStreamUrl(sessionId, token);
  let eventSource: EventSource | null = new EventSource(url);
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  let reconnectDelay = 1000;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isManuallyClosed = false;

  const setupHandlers = (es: EventSource) => {
    es.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        if (data.status === 'ai_responded' && data.message) {
          callbacks.onAIResponse?.(processAIResponse({
            message: data.message as string,
            audio_base64: data.audio as string | undefined,
            last_node: data.last_node as string | undefined,
          }));
          return;
        }
        switch (data.type) {
          case 'status':
            callbacks.onStatusUpdate?.(data.status as string);
            break;
          case 'ai_response':
            callbacks.onAIResponse?.(processAIResponse(data as Record<string, unknown>));
            break;
          case 'transcription':
            callbacks.onTranscript?.(data.transcript as string);
            break;
          case 'quality_warning':
            callbacks.onQualityWarning?.({ type: data.warning_type as string, message: data.message as string });
            break;
          case 'complete':
            callbacks.onComplete?.(data);
            es.close();
            break;
          case 'error':
            callbacks.onError?.(data.message as string);
            if (data.fatal) es.close();
            break;
          default:
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.addEventListener('ai_response', (e: Event) => {
      try {
        const data = JSON.parse((e as MessageEvent).data as string);
        callbacks.onAIResponse?.(processAIResponse(data));
      } catch {
        // ignore
      }
    });
    es.addEventListener('transcription', (e: Event) => {
      try {
        const data = JSON.parse((e as MessageEvent).data as string);
        callbacks.onTranscript?.(data.transcript ?? data.text);
      } catch {
        // ignore
      }
    });
    es.addEventListener('status', (e: Event) => {
      try {
        const data = JSON.parse((e as MessageEvent).data as string);
        callbacks.onStatusUpdate?.(data.status);
      } catch {
        // ignore
      }
    });
    es.addEventListener('complete', (e: Event) => {
      try {
        const data = JSON.parse((e as MessageEvent).data as string);
        callbacks.onComplete?.(data);
        es.close();
      } catch {
        // ignore
      }
    });
    es.addEventListener('error', (e: Event) => {
      try {
        const data = JSON.parse((e as MessageEvent).data as string);
        callbacks.onError?.(data.message);
        if (data.fatal) es.close();
      } catch {
        // ignore
      }
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED && !isManuallyClosed && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts - 1), 30000);
        callbacks.onConnectionIssue?.({
          type: 'reconnecting',
          message: `Reconnecting in ${Math.round(delay / 1000)}s (${reconnectAttempts}/${maxReconnectAttempts})`,
          attempt: reconnectAttempts,
          maxAttempts: maxReconnectAttempts,
        });
        reconnectTimer = setTimeout(() => {
          es.close();
          eventSource = new EventSource(url);
          setupHandlers(eventSource);
        }, delay);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        callbacks.onConnectionIssue?.({
          type: 'connection_failed',
          message: 'Failed to reconnect. Please refresh the page.',
        });
      }
    };

    es.onopen = () => {
      reconnectAttempts = 0;
      reconnectDelay = 1000;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };
  };

  setupHandlers(eventSource);

  return {
    close: () => {
      isManuallyClosed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    },
  };
}

/**
 * Wait for AI response with polling.
 */
export async function waitForAIResponse(
  sessionId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<PollStatusResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await pollInterviewStatus(sessionId);
    if (status.aiResponse) return status;
    if (status.isComplete) return status;
    if (status.error) throw new Error(status.error);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Interview response timeout');
}
