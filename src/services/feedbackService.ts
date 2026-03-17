import { nestClient } from '../api/axiosInstance';
import { FEEDBACK_ENDPOINTS } from '../constants/apiEndpoints';
import type { InterviewFeedback, SessionHistoryResponse } from '../types/feedback';

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
  return data?.feedback ?? null;
}
