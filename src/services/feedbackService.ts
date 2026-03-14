import { nestClient } from '../api/axiosInstance';
import { FEEDBACK_ENDPOINTS } from '../constants/apiEndpoints';
import type { SessionHistoryResponse } from '../types/feedback';

export type SessionHistoryParams =
  | { interview_id: number; interview_type: string }
  | { session_id: string; session_type: string };

/**
 * Fetch video interview session history / feedback.
 * Use interview_id + interview_type when opening from dashboard report;
 * use session_id + session_type when coming from a just-finished interview.
 */
export async function getSessionHistory(
  params: SessionHistoryParams
): Promise<SessionHistoryResponse> {
  const response = await nestClient.get(FEEDBACK_ENDPOINTS.SESSION_HISTORY, {
    params: 'interview_id' in params
      ? { interview_id: params.interview_id, interview_type: params.interview_type }
      : { session_id: params.session_id, session_type: params.session_type },
  });
  const data = response.data as SessionHistoryResponse;
  return data ?? {};
}
