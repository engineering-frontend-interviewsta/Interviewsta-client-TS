import { useState, useRef, useCallback, useEffect } from 'react';
import {
  connectToInterviewStream,
  submitResponse,
  getRespondTaskStatus,
  endInterview,
} from '../services/interviewService';
import type { AIResponseData, RespondTaskResult } from '../types/interview';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120;

function extractMessage(res: RespondTaskResult): string | undefined {
  return res?.result?.message ?? res?.interview_ai_response?.message;
}

export interface UseInterviewSessionParams {
  sessionId: string;
  interviewType: string;
}

export interface UseInterviewSessionResult {
  aiMessage: string;
  status: string;
  isComplete: boolean;
  error: string | null;
  isSubmitting: boolean;
  submitText: (text: string) => Promise<void>;
  endSession: (opts?: { sessionFinished?: boolean }) => Promise<void>;
}

export function useInterviewSession({
  sessionId,
  interviewType,
}: UseInterviewSessionParams): UseInterviewSessionResult {
  const [aiMessage, setAiMessage] = useState('');
  const [status, setStatus] = useState('connecting');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const streamCloseRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) return;
    try {
      const { close } = connectToInterviewStream(sessionId, {
        onStatusUpdate: (s) => setStatus(s),
        onAIResponse: (data: AIResponseData) => {
          if (data.message != null) setAiMessage(data.message);
        },
        onComplete: () => {
          setIsComplete(true);
          streamCloseRef.current?.();
        },
        onError: (msg) => setError((e) => (e ? e : msg)),
      });
      streamCloseRef.current = close;
      return () => {
        close();
        streamCloseRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
    }
  }, [sessionId]);

  const submitText = useCallback(
    async (text: string) => {
      if (!text.trim() || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const { taskId } = await submitResponse({
          sessionId,
          textResponse: text.trim(),
        });
        let attempts = 0;
        const poll = async (): Promise<void> => {
          if (attempts >= MAX_POLL_ATTEMPTS) {
            setError('Response timeout');
            setIsSubmitting(false);
            return;
          }
          attempts++;
          const res = (await getRespondTaskStatus(sessionId, taskId)) as RespondTaskResult;
          if (res?.status === 'completed') {
            const msg = extractMessage(res);
            if (msg != null) setAiMessage(msg);
            setIsSubmitting(false);
            return;
          }
          if (res?.status === 'failed') {
            setError(res?.error ?? 'Response failed');
            setIsSubmitting(false);
            return;
          }
          setTimeout(poll, POLL_INTERVAL_MS);
        };
        await poll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit');
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting]
  );

  const endSession = useCallback(
    async (opts?: { sessionFinished?: boolean }) => {
      streamCloseRef.current?.();
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      try {
        await endInterview({
          sessionId,
          interviewType,
          duration,
          sessionFinished: opts?.sessionFinished ?? true,
        });
      } finally {
        setIsComplete(true);
      }
    },
    [sessionId, interviewType]
  );

  return {
    aiMessage,
    status,
    isComplete,
    error,
    isSubmitting,
    submitText,
    endSession,
  };
}
