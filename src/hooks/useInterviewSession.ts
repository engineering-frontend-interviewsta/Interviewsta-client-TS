import { useState, useRef, useCallback, useEffect } from 'react';
import {
  connectToInterviewStream,
  submitResponse,
  getRespondTaskStatus,
  endInterview,
} from '../services/interviewService';
import type {
  AIResponseData,
  RespondTaskResult,
  CommunicationData,
  InterviewAIResponsePayload,
} from '../types/interview';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120;

const emptyCommunicationData: CommunicationData = {
  speaking: null,
  speakingFeedback: null,
  comprehension: null,
  comprehensionFeedback: null,
  mcq: null,
  mcqCount: 0,
  mcqFeedback: null,
  mcqResults: null,
};

function extractMessage(res: RespondTaskResult): string | undefined {
  return res?.result?.message ?? res?.interview_ai_response?.message;
}

function mergeCommunicationFromResponse(
  prev: CommunicationData,
  payload: InterviewAIResponsePayload | undefined
): CommunicationData {
  if (!payload) return prev;
  const next = { ...prev };
  if (payload.currentspeaking != null) {
    next.speaking = {
      instruction: payload.currentspeaking.instruction,
      paragraph: payload.currentspeaking.paragraph,
    };
  }
  if (payload.speakingfeedback != null) next.speakingFeedback = payload.speakingfeedback;
  if (payload.currentcomprehension != null) {
    next.comprehension = {
      instruction: payload.currentcomprehension.instruction,
      question: payload.currentcomprehension.question ?? payload.currentcomprehension.paragraph,
    };
  }
  if (payload.comprehensionfeedback != null) next.comprehensionFeedback = payload.comprehensionfeedback;
  if (payload.currentmcq != null) {
    const newQuestion = payload.currentmcq.question ?? '';
    const isNewQuestion = prev.mcq?.question !== newQuestion;
    next.mcq = {
      instruction: payload.currentmcq.instruction,
      question: payload.currentmcq.question,
      options: payload.currentmcq.options,
    };
    if (isNewQuestion) next.mcqCount = Math.min(prev.mcqCount + 1, 4);
  }
  if (payload.mcqfeedback != null) next.mcqFeedback = payload.mcqfeedback;
  if (payload.mcq_results != null) next.mcqResults = payload.mcq_results;
  return next;
}

export interface UseInterviewSessionParams {
  sessionId: string;
  interviewType: string;
}

export interface UseInterviewSessionResult {
  aiMessage: string;
  lastNode: string | null;
  communicationData: CommunicationData;
  status: string;
  isComplete: boolean;
  error: string | null;
  isSubmitting: boolean;
  submitText: (text: string) => Promise<void>;
  submitAudio: (audio: Blob) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  endSession: (opts?: { sessionFinished?: boolean }) => Promise<void>;
  /** Update communication state (e.g. clear phase feedback) */
  updateCommunicationData: (fn: (prev: CommunicationData) => CommunicationData) => void;
}

export function useInterviewSession({
  sessionId,
  interviewType,
}: UseInterviewSessionParams): UseInterviewSessionResult {
  const [aiMessage, setAiMessage] = useState('');
  const [lastNode, setLastNode] = useState<string | null>(null);
  const [communicationData, setCommunicationData] = useState<CommunicationData>(() => emptyCommunicationData);
  const [status, setStatus] = useState('connecting');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const streamCloseRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(Date.now());
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const playNext = useCallback(() => {
    if (isPlayingRef.current) return;
    const next = audioQueueRef.current.shift();
    if (!next) return;
    isPlayingRef.current = true;
    const audio = new Audio(`data:audio/wav;base64,${next}`);
    audio.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) {
        playNext();
      }
    };
    audio.onerror = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) {
        playNext();
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    audio.play();
  }, []);

  const enqueueAudio = useCallback(
    (base64: string | undefined) => {
      if (!base64) return;
      audioQueueRef.current.push(base64);
      if (!isPlayingRef.current) {
        playNext();
      }
    },
    [playNext]
  );

  useEffect(() => {
    if (!sessionId) return;
    try {
      const { close } = connectToInterviewStream(sessionId, {
        onStatusUpdate: (s) => setStatus(s),
        onAIResponse: (data: AIResponseData) => {
          if (data.message != null) setAiMessage(data.message);
          if (data.audioBase64) enqueueAudio(data.audioBase64);
          if (data.lastNode != null) setLastNode(data.lastNode);
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
            const ia = res?.interview_ai_response;
            if (ia?.last_node != null) setLastNode(ia.last_node);
            if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
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

  const submitAudio = useCallback(
    async (audio: Blob) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result;
            if (typeof res === 'string') {
              // strip data URL prefix if present
              const commaIndex = res.indexOf(',');
              resolve(commaIndex >= 0 ? res.slice(commaIndex + 1) : res);
            } else {
              reject(new Error('Failed to read audio'));
            }
          };
          reader.onerror = () => reject(reader.error ?? new Error('Failed to read audio'));
          reader.readAsDataURL(audio);
        });

        const { taskId } = await submitResponse({
          sessionId,
          audioData: base64,
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
            if (res.interview_ai_response?.audio_base64) {
              enqueueAudio(res.interview_ai_response.audio_base64);
            }
            const ia = res?.interview_ai_response;
            if (ia?.last_node != null) setLastNode(ia.last_node);
            if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
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
        setError(err instanceof Error ? err.message : 'Failed to submit audio');
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, enqueueAudio]
  );

  const submitCode = useCallback(
    async (code: string) => {
      if (!code.trim() || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const { taskId } = await submitResponse({
          sessionId,
          codeInput: code,
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
            if (res.interview_ai_response?.audio_base64) {
              enqueueAudio(res.interview_ai_response.audio_base64);
            }
            const ia = res?.interview_ai_response;
            if (ia?.last_node != null) setLastNode(ia.last_node);
            if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
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
        setError(err instanceof Error ? err.message : 'Failed to submit code');
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, enqueueAudio]
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
    lastNode,
    communicationData,
    status,
    isComplete,
    error,
    isSubmitting,
    submitText,
    submitAudio,
    submitCode,
    endSession,
    updateCommunicationData: setCommunicationData,
  };
}
