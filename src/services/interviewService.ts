import Config from '../config';
import { nestClient, fastApiClient, getInterviewAccessToken as getStoredInterviewAccessToken } from '../api/axiosInstance';
import { INTERVIEW_ENDPOINTS } from '../constants/apiEndpoints';
import { getAuthToken } from '../utils/auth';
import { setInterviewAccessToken } from '../utils/storage';
import type {
  StartInterviewResult,
  StartInterviewParams,
  StartTaskStatusResult,
  SubmitResponseResult,
  PollStatusResult,
  AIResponseData,
  InterviewStreamCallbacks,
  RespondCompleteSsePayload,
  InterviewAIResponsePayload,
} from '../types/interview';
import type {
  InterviewTestsPaginatedResponse,
  ParentInterviewType,
} from '../types/interviewTest';
import type { InterviewVideoTelemetrySample } from '../types/videoTelemetry';

const DEFAULT_PAGE_SIZE = 10;

/** Fetch paginated interview tests (All interviews). */
export async function getInterviewTests(params: {
  page?: number;
  limit?: number;
}): Promise<InterviewTestsPaginatedResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;
  const response = await nestClient.get<InterviewTestsPaginatedResponse>(
    INTERVIEW_ENDPOINTS.INTERVIEW_TESTS(String(page), String(limit))
  );
  return response.data;
}

/** Fetch all parent interview types (for tabs). */
export async function getInterviewParentTypes(): Promise<ParentInterviewType[]> {
  const response = await nestClient.get<ParentInterviewType[]>(INTERVIEW_ENDPOINTS.PARENT_INTERVIEW_TYPES);
  const data = response.data;
  return Array.isArray(data) ? data : [];
}

/** Fetch paginated interview tests for a given parent type. */
export async function getInterviewTestsByParentType(
  parentTypeId: string,
  params: { page?: number; limit?: number }
): Promise<InterviewTestsPaginatedResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;
  const response = await nestClient.get<InterviewTestsPaginatedResponse>(
    INTERVIEW_ENDPOINTS.BY_PARENT_TYPE(parentTypeId, String(page), String(limit))
  );
  return response.data;
}

/** Error when GET_TOKEN fails (credits, not found, or bad request). */
export class InterviewAccessTokenError extends Error {
  code: 400 | 403 | 404;
  constructor(message: string, code: 400 | 403 | 404) {
    super(message);
    this.name = 'InterviewAccessTokenError';
    this.code = code;
  }
}

const GET_TOKEN_ERROR_MESSAGES: Record<number, string> = {
  400: 'interview_type_id required',
  403: 'Insufficient credits',
  404: 'Interview type not found',
};

/**
 * Get interview access token (checks credits, returns JWT for interview contract).
 * Persists the token to sessionStorage so the interview interface can use it for the stream.
 * @throws {InterviewAccessTokenError} on 400, 403, 404 with server message or default
 */
export async function getInterviewAccessToken(interviewTestId: string): Promise<string> {
  try {
    const response = await nestClient.get<{ token: string }>(INTERVIEW_ENDPOINTS.GET_TOKEN(interviewTestId));
    const token = response.data?.token;
    if (!token) throw new InterviewAccessTokenError('Invalid token response', 400);
    setInterviewAccessToken(token);
    return token;
  } catch (err: unknown) {
    const status = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { status?: number; data?: { message?: string } } }).response?.status
      : undefined;
    const message =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    const code = status === 403 ? 403 : status === 404 ? 404 : 400;
    const fallback = GET_TOKEN_ERROR_MESSAGES[code] ?? 'Could not get interview access';
    throw new InterviewAccessTokenError(message ?? fallback, code);
  }
}

/**
 * Start a new interview session.
 * Request body: { session_id, payload: { resume?, interview_test_id, Tags?, company?, QuestionResearch? } }
 */
export async function startInterview(params: StartInterviewParams): Promise<StartInterviewResult> {
  const finalSessionId = params.sessionId ?? crypto.randomUUID();
  const response = await fastApiClient.post(INTERVIEW_ENDPOINTS.START, {
    session_id: finalSessionId,
    payload: params.payload,
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
  /** Dev mode: skip TTS on the server (no AI voice in stream/poll). */
  skipAudio?: boolean;
}): Promise<SubmitResponseResult> {
  const body: Record<string, unknown> = {};
  if (params.textResponse != null && params.textResponse !== '') body.text_response = params.textResponse;
  if (params.audioData != null && params.audioData !== '') body.audio_data = params.audioData;
  if (params.codeInput != null && params.codeInput !== '') body.code_input = params.codeInput;
  if (body.audio_data && params.sampleRate != null) body.sample_rate = params.sampleRate;
  if (params.skipAudio) body.skip_audio = true;

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
 * Append one video telemetry sample (`POST .../video-telemetry`).
 * Uses user JWT + `X-Interview-Access-Token` from `fastApiClient`. Does not throw.
 */
export async function postVideoTelemetry(
  sessionId: string,
  payload: InterviewVideoTelemetrySample
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
 * Build SSE stream URL per API spec:
 * GET /api/v1/interview/{session_id}/stream?token={bearer_jwt}&interview_access_token={interview_contract_jwt}
 */
function getStreamUrl(sessionId: string, bearerJwt: string, interviewContractJwt: string): string {
  const base = Config.FASTAPI_BASE_URL;
  const path = INTERVIEW_ENDPOINTS.STREAM(sessionId);
  const full = base.endsWith('/') ? `${base.slice(0, -1)}${path}` : `${base}${path}`;
  const params = new URLSearchParams({
    token: bearerJwt,
    interview_access_token: interviewContractJwt,
  });
  return `${full}?${params.toString()}`;
}

function processAIResponse(data: {
  message?: string;
  audio_base64?: string;
  audio?: string;
  audioBase64?: string;
  question_number?: number;
  total_questions?: number;
  last_node?: string;
  lastNode?: string;
  type?: string;
}): AIResponseData {
  const audioBase64 = data.audio_base64 ?? data.audio ?? data.audioBase64;
  return {
    message: data.message,
    audioBase64,
    questionNumber: data.question_number,
    totalQuestions: data.total_questions,
    lastNode: data.last_node ?? data.lastNode,
  };
}

/**
 * Backend often sends the AI turn as raw JSON (message + audio + last_node) on the default SSE
 * `message` event without a `type` field. Only treat as AI when it is clearly not another envelope.
 */
function isDirectAiResponsePayload(data: Record<string, unknown>): boolean {
  const d = unwrapNestedAiEnvelope(data);
  if (typeof d.message !== 'string' || d.message.trim() === '') return false;
  if (typeof d.type === 'string' && d.type !== '') return false;
  return (
    typeof d.audio === 'string' ||
    typeof d.audio_base64 === 'string' ||
    typeof d.audioBase64 === 'string' ||
    typeof d.last_node === 'string' ||
    typeof d.lastNode === 'string' ||
    typeof d.question_number === 'number' ||
    typeof d.total_questions === 'number'
  );
}

function parseSseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(raw) as unknown;
    return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Backend sometimes wraps AI payloads as `{ "data": { "message", "audio", ... } }` on `ai_response`.
 */
function unwrapNestedAiEnvelope(data: Record<string, unknown>): Record<string, unknown> {
  const inner = data.data;
  if (inner !== null && typeof inner === 'object' && !Array.isArray(inner)) {
    const o = inner as Record<string, unknown>;
    if (
      typeof o.message === 'string' ||
      typeof o.audio === 'string' ||
      typeof o.audio_base64 === 'string' ||
      typeof o.audioBase64 === 'string' ||
      typeof o.last_node === 'string' ||
      typeof o.lastNode === 'string'
    ) {
      return o;
    }
  }
  return data;
}

function toRespondCompletePayload(raw: Record<string, unknown>): RespondCompleteSsePayload {
  return {
    task_id: raw.task_id as string | undefined,
    status: raw.status as string | undefined,
    result: raw.result as RespondCompleteSsePayload['result'],
    interview_ai_response:
      (raw.interview_ai_response as InterviewAIResponsePayload | undefined) ??
      (raw.interviewAiResponse as InterviewAIResponsePayload | undefined),
    interview_transcript:
      (raw.interview_transcript as string | undefined) ??
      (raw.interviewTranscript as string | undefined),
    error: raw.error as string | undefined,
  };
}

function bindSseJsonHandler(
  es: EventSource,
  eventName: string,
  handler: (data: Record<string, unknown>) => void
): void {
  es.addEventListener(eventName, (e: Event) => {
    const me = e as MessageEvent;
    const raw = me.data;
    if (raw == null || raw === '') return;
    const data = parseSseJsonObject(String(raw));
    if (data) handler(data);
  });
}

/**
 * Connect to interview SSE stream. Returns { close } to disconnect.
 * Requires interview access token to be set (set before start, cleared on leave).
 */
export function connectToInterviewStream(
  sessionId: string,
  callbacks: InterviewStreamCallbacks
): { close: () => void } {
  const bearerJwt = getAuthToken();
  const interviewContractJwt = getStoredInterviewAccessToken();
  if (!interviewContractJwt) {
    callbacks.onError?.('Interview session token missing. Please start the interview again.');
    return { close: () => {} };
  }
  const url = getStreamUrl(sessionId, bearerJwt, interviewContractJwt);
  let eventSource: EventSource | null = new EventSource(url);
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  let reconnectDelay = 1000;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isManuallyClosed = false;

  const setupHandlers = (es: EventSource) => {
    es.onmessage = (event: MessageEvent) => {
      try {
        const raw = event.data;
        if (raw == null || raw === '') return;
        const data = parseSseJsonObject(String(raw));
        if (!data) return;
        const flatForAi = unwrapNestedAiEnvelope(data);
        if (data.status === 'ai_responded' && typeof flatForAi.message === 'string') {
          callbacks.onAIResponse?.(
            processAIResponse(flatForAi as Parameters<typeof processAIResponse>[0])
          );
          return;
        }
        if (isDirectAiResponsePayload(data)) {
          const flat = unwrapNestedAiEnvelope(data);
          callbacks.onAIResponse?.(processAIResponse(flat as Parameters<typeof processAIResponse>[0]));
          return;
        }
        switch (data.type) {
          case 'status':
            callbacks.onStatusUpdate?.(data.status as string);
            break;
          case 'ai_response': {
            const flat = unwrapNestedAiEnvelope(data);
            callbacks.onAIResponse?.(processAIResponse(flat as Parameters<typeof processAIResponse>[0]));
            break;
          }
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
        const me = e as MessageEvent;
        const raw = me.data;
        if (raw == null || raw === '') return;
        const data = parseSseJsonObject(String(raw));
        if (data) {
          const flat = unwrapNestedAiEnvelope(data);
          callbacks.onAIResponse?.(processAIResponse(flat as Parameters<typeof processAIResponse>[0]));
        }
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
        const raw = (e as MessageEvent).data;
        if (raw == null || raw === '') return;
        const data = JSON.parse(raw as string) as {
          error?: string;
          message?: string;
          fatal?: boolean;
        };
        const msg = data.error ?? data.message;
        if (msg) callbacks.onError?.(msg);
        if (data.fatal) es.close();
      } catch {
        // ignore
      }
    });

    bindSseJsonHandler(es, 'connected', (data) => callbacks.onConnected?.(data));
    bindSseJsonHandler(es, 'heartbeat', (data) => callbacks.onHeartbeat?.(data));
    bindSseJsonHandler(es, 'celery_start', (data) =>
      callbacks.onCeleryStart?.({
        task_id: data.task_id as string | undefined,
        phase: data.phase as string | undefined,
      })
    );
    bindSseJsonHandler(es, 'start_progress', (data) =>
      callbacks.onStartProgress?.({
        progress: typeof data.progress === 'number' ? data.progress : undefined,
        message: typeof data.message === 'string' ? data.message : undefined,
      })
    );
    /** Many backends emit `event: progress` for start (and sometimes respond) instead of `start_progress`. */
    bindSseJsonHandler(es, 'progress', (data) => {
      const progress = typeof data.progress === 'number' ? data.progress : undefined;
      const message = typeof data.message === 'string' ? data.message : undefined;
      const status = typeof data.status === 'string' ? data.status : undefined;
      callbacks.onStartProgress?.({ progress, message });
      if (status === 'completed') {
        callbacks.onStartComplete?.(data);
      }
      if (status === 'failed') {
        const err =
          (typeof data.error === 'string' ? data.error : null) ??
          (typeof data.message === 'string' ? data.message : null) ??
          'Task failed';
        callbacks.onStartFailed?.({
          task_id: data.task_id as string | undefined,
          error: err,
        });
      }
    });
    bindSseJsonHandler(es, 'start_complete', (data) => callbacks.onStartComplete?.(data));
    bindSseJsonHandler(es, 'start_failed', (data) =>
      callbacks.onStartFailed?.({
        task_id: data.task_id as string | undefined,
        error:
          (typeof data.error === 'string' ? data.error : undefined) ??
          (typeof data.message === 'string' ? data.message : undefined),
      })
    );
    bindSseJsonHandler(es, 'celery_respond', (data) =>
      callbacks.onCeleryRespond?.({ task_id: data.task_id as string | undefined })
    );
    bindSseJsonHandler(es, 'respond_progress', (data) =>
      callbacks.onRespondProgress?.({
        progress: typeof data.progress === 'number' ? data.progress : undefined,
        message: typeof data.message === 'string' ? data.message : undefined,
      })
    );
    bindSseJsonHandler(es, 'respond_complete', (data) =>
      callbacks.onRespondComplete?.(toRespondCompletePayload(data))
    );
    bindSseJsonHandler(es, 'respond_failed', (data) =>
      callbacks.onRespondFailed?.({
        task_id: data.task_id as string | undefined,
        error:
          (typeof data.error === 'string' ? data.error : undefined) ??
          (typeof data.message === 'string' ? data.message : undefined),
      })
    );
    bindSseJsonHandler(es, 'feedback_queued', (data) => callbacks.onFeedbackQueued?.(data));
    bindSseJsonHandler(es, 'feedback_complete', (data) => callbacks.onFeedbackComplete?.(data));

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
