import { nestClient } from '../api/axiosInstance';
import { FEEDBACK_ENDPOINTS } from '../constants/apiEndpoints';
import type { FeedbackTelemetryData, InterviewFeedback, SessionHistoryResponse } from '../types/feedback';

// New feedback API: query by either sessionId (live session) or feedbackId (stored report)
export type SessionHistoryParams =
  | { sessionId: string }
  | { feedbackId: number };

/**
 * Fetch video interview session history / feedback.
 * Use sessionId when coming from a just-finished interview;
 * use feedbackId when opening an existing feedback/report (e.g. from dashboard).
 */
export async function getSessionHistory(
  params: SessionHistoryParams
): Promise<InterviewFeedback | null> {
  const response = await nestClient.get(FEEDBACK_ENDPOINTS.SESSION_HISTORY, {
    params: 'sessionId' in params
      ? { sessionId: params.sessionId }
      : { feedbackId: params.feedbackId },
  });
  const data = response.data as SessionHistoryResponse;
  const fb = data?.feedback ?? null;
  if (fb && fb.telemetryData == null && 'telemetry_data' in fb) {
    const snake = (fb as InterviewFeedback & { telemetry_data?: FeedbackTelemetryData | null }).telemetry_data;
    if (snake != null) (fb as InterviewFeedback).telemetryData = snake;
  }
  return fb;
}
