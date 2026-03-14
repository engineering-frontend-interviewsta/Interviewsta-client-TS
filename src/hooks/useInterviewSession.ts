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

export interface InterviewMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
  /** When true, TTS audio is skipped (dev mode). */
  devMode?: boolean;
}

export type EndSessionOpts = { sessionFinished?: boolean; interviewTestId?: number };

export interface UseInterviewSessionResult {
  aiMessage: string;
  /** Conversation transcript (AI + user messages) for display */
  messages: InterviewMessage[];
  lastNode: string | null;
  communicationData: CommunicationData;
  status: string;
  isComplete: boolean;
  error: string | null;
  isSubmitting: boolean;
  /** True while TTS is playing; use to disable VAD so user doesn't speak over AI */
  isPlayingAudio: boolean;
  /** Add a user message to the transcript (e.g. when user sends text input) */
  addUserMessage: (content: string) => void;
  submitText: (text: string) => Promise<void>;
  submitAudio: (audio: Blob) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  endSession: (opts?: EndSessionOpts) => Promise<string | null>;
  updateCommunicationData: (fn: (prev: CommunicationData) => CommunicationData) => void;
}

export function useInterviewSession({
  sessionId,
  interviewType,
  devMode = false,
}: UseInterviewSessionParams): UseInterviewSessionResult {
  const [aiMessage, setAiMessage] = useState('');
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [lastNode, setLastNode] = useState<string | null>(null);
  const [communicationData, setCommunicationData] = useState<CommunicationData>(() => emptyCommunicationData);
  const [status, setStatus] = useState('connecting');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const streamCloseRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(Date.now());
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const addAIMessage = useCallback((content: string) => {
    const t = content?.trim();
    if (!t) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'ai' && last.content === t) return prev;
      return [...prev, { id: nextId(), type: 'ai', content: t, timestamp: new Date() }];
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const t = content?.trim();
    if (!t) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'user' && last.content === t) return prev;
      return [...prev, { id: nextId(), type: 'user', content: t, timestamp: new Date() }];
    });
  }, []);

  const playNext = useCallback(() => {
    if (isPlayingRef.current) return;
    const next = audioQueueRef.current.shift();
    if (!next) return;
    isPlayingRef.current = true;
    setIsPlayingAudio(true);
    const audio = new Audio(`data:audio/wav;base64,${next}`);
    audio.onended = () => {
      isPlayingRef.current = false;
      setIsPlayingAudio(false);
      if (audioQueueRef.current.length > 0) {
        playNext();
      }
    };
    audio.onerror = () => {
      isPlayingRef.current = false;
      setIsPlayingAudio(false);
      if (audioQueueRef.current.length > 0) {
        playNext();
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    audio.play();
  }, []);

  const enqueueAudio = useCallback(
    (base64: string | undefined) => {
      if (!base64 || devMode) return;
      audioQueueRef.current.push(base64);
      if (!isPlayingRef.current) {
        playNext();
      }
    },
    [playNext, devMode]
  );

  useEffect(() => {
    if (!sessionId) return;
    try {
      const { close } = connectToInterviewStream(sessionId, {
        onStatusUpdate: (s) => setStatus(s),
        onAIResponse: (data: AIResponseData) => {
          if (data.message != null) {
            setAiMessage(data.message);
            addAIMessage(data.message);
          }
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
  }, [sessionId, addAIMessage, enqueueAudio]);

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
            if (res.interview_transcript?.trim()) addUserMessage(res.interview_transcript);
            if (msg != null) {
              setAiMessage(msg);
              addAIMessage(msg);
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
        setError(err instanceof Error ? err.message : 'Failed to submit');
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, addUserMessage, addAIMessage]
  );

  const submitAudio = useCallback(
    async (audio: Blob) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        // Backend expects WAV with RIFF header; MediaRecorder gives webm/opus — convert first
        const { blobToWavBase64 } = await import('../utils/blobToWav');
        const base64 = await blobToWavBase64(audio);

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
            if (res.interview_transcript?.trim()) addUserMessage(res.interview_transcript);
            if (msg != null) {
              setAiMessage(msg);
              addAIMessage(msg);
            }
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
    [sessionId, isSubmitting, enqueueAudio, addUserMessage, addAIMessage]
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
            if (res.interview_transcript?.trim()) addUserMessage(res.interview_transcript);
            if (msg != null) {
              setAiMessage(msg);
              addAIMessage(msg);
            }
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
    [sessionId, isSubmitting, enqueueAudio, addUserMessage, addAIMessage]
  );

  const endSession = useCallback(
    async (opts?: EndSessionOpts): Promise<string | null> => {
      streamCloseRef.current?.();
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      try {
        const result = (await endInterview({
          sessionId,
          interviewType,
          duration,
          sessionFinished: opts?.sessionFinished ?? true,
          interviewTestId: opts?.interviewTestId,
        })) as { task_id?: string; session_id?: string; status?: string } | undefined;
        return result?.task_id ?? null;
      } finally {
        setIsComplete(true);
      }
    },
    [sessionId, interviewType]
  );

  return {
    aiMessage,
    messages,
    lastNode,
    communicationData,
    status,
    isComplete,
    error,
    isSubmitting,
    isPlayingAudio,
    addUserMessage,
    submitText,
    submitAudio,
    submitCode,
    endSession,
    updateCommunicationData: setCommunicationData,
  };
}
