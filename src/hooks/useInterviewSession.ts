import { useState, useRef, useCallback, useEffect, type MutableRefObject } from 'react';
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
import { USER_TRANSCRIPT_PENDING_LABEL } from '../constants/interviewSessionUi';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120;

const ERROR_LOG_PREFIX = '[useInterviewSession] setError';

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
  /**
   * When `.current` is false at event time, SSE user transcripts are not appended
   * (matches legacy Communication interview: hide STT in main chat during structured rounds).
   */
  appendStreamUserTranscriptRef?: MutableRefObject<boolean>;
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
  /** First AI message/audio has arrived (SSE); use to avoid empty interview flash. */
  gleeHasJoined: boolean;
  /** True after ~75s without Glee; UI may offer "continue anyway". */
  gleeJoinWaitTimedOut: boolean;
  bypassGleeJoinGate: () => void;
  /** Real user transcript is shown this turn (after voice: not placeholder). */
  userTranscriptVisibleThisTurn: boolean;
  /** Poll finished but last transcript line is still user — waiting for SSE / TTS. */
  awaitingStreamAi: boolean;
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
  appendStreamUserTranscriptRef,
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
  const [gleeJoined, setGleeJoined] = useState(false);
  const [gleeJoinWaitTimedOut, setGleeJoinWaitTimedOut] = useState(false);
  const [userLineCommitted, setUserLineCommitted] = useState(false);
  const [awaitingStreamAi, setAwaitingStreamAi] = useState(false);
  const streamCloseRef = useRef<(() => void) | null>(null);
  const prevSessionIdRef = useRef<string | undefined>(undefined);
  const startTimeRef = useRef(Date.now());
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const blockedAudioRef = useRef<string | null>(null);

  const addAIMessage = useCallback((content: string) => {
    const t = content?.trim();
    if (!t) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'ai' && last.content === t) return prev;
      return [...prev, { id: nextId(), type: 'ai', content: t, timestamp: new Date() }];
    });
  }, []);

  const pushPendingUserLine = useCallback(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'user' && last.content === USER_TRANSCRIPT_PENDING_LABEL) return prev;
      return [...prev, { id: nextId(), type: 'user', content: USER_TRANSCRIPT_PENDING_LABEL, timestamp: new Date() }];
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const t = content?.trim();
    if (!t) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'user' && last.content === USER_TRANSCRIPT_PENDING_LABEL) {
        return [...prev.slice(0, -1), { ...last, content: t, timestamp: new Date() }];
      }
      if (last?.type === 'user' && last.content === t) return prev;
      return [...prev, { id: nextId(), type: 'user', content: t, timestamp: new Date() }];
    });
    if (t !== USER_TRANSCRIPT_PENDING_LABEL) {
      setUserLineCommitted(true);
    }
  }, []);

  const bypassGleeJoinGate = useCallback(() => {
    setGleeJoined(true);
    setGleeJoinWaitTimedOut(false);
  }, []);

  const stripPendingUserLine = useCallback(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'user' && last.content === USER_TRANSCRIPT_PENDING_LABEL) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, []);

  const playNext = useCallback(() => {
    if (isPlayingRef.current) return;
    const next = audioQueueRef.current.shift();
    if (!next) return;
    isPlayingRef.current = true;
    setIsPlayingAudio(true);
    // Backend TTS is AWS Polly MP3.
    const audio = new Audio(`data:audio/mpeg;base64,${next}`);
    audio.onended = () => {
      isPlayingRef.current = false;
      setIsPlayingAudio(false);
      if (audioQueueRef.current.length > 0) {
        playNext();
      }
    };
    audio.onerror = () => {
      // Fallback if payload is not MP3 for any reason.
      const fallback = new Audio(`data:audio/wav;base64,${next}`);
      fallback.onended = () => {
        isPlayingRef.current = false;
        setIsPlayingAudio(false);
        if (audioQueueRef.current.length > 0) playNext();
      };
      fallback.onerror = () => {
        isPlayingRef.current = false;
        setIsPlayingAudio(false);
        if (audioQueueRef.current.length > 0) playNext();
      };
      void fallback.play().catch(() => {
        blockedAudioRef.current = next;
        isPlayingRef.current = false;
        setIsPlayingAudio(false);
      });
    };
    void audio.play().catch(() => {
      // Browser autoplay can block until user gesture.
      blockedAudioRef.current = next;
      isPlayingRef.current = false;
      setIsPlayingAudio(false);
    });
  }, []);

  const enqueueAudio = useCallback(
    (base64: string | undefined) => {
      if (!base64) return;
      setGleeJoined(true);
      audioQueueRef.current.push(base64);
      if (!isPlayingRef.current) {
        playNext();
      }
    },
    [playNext]
  );

  useEffect(() => {
    const retryBlockedAudio = () => {
      const blocked = blockedAudioRef.current;
      if (!blocked || isPlayingRef.current) return;
      blockedAudioRef.current = null;
      audioQueueRef.current.unshift(blocked);
      playNext();
    };

    window.addEventListener('click', retryBlockedAudio);
    window.addEventListener('keydown', retryBlockedAudio);
    window.addEventListener('touchstart', retryBlockedAudio);
    return () => {
      window.removeEventListener('click', retryBlockedAudio);
      window.removeEventListener('keydown', retryBlockedAudio);
      window.removeEventListener('touchstart', retryBlockedAudio);
    };
  }, [playNext]);

  useEffect(() => {
    if (!sessionId) return;
    const prev = prevSessionIdRef.current;
    prevSessionIdRef.current = sessionId;
    if (prev === undefined || prev === sessionId) return;
    setMessages([]);
    setAiMessage('');
    setLastNode(null);
    setCommunicationData(emptyCommunicationData);
    setGleeJoined(false);
    setGleeJoinWaitTimedOut(false);
    setUserLineCommitted(false);
    setAwaitingStreamAi(false);
    setStatus('connecting');
    setError(null);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || gleeJoined) return;
    const t = window.setTimeout(() => setGleeJoinWaitTimedOut(true), 75_000);
    return () => window.clearTimeout(t);
  }, [sessionId, gleeJoined]);

  useEffect(() => {
    if (isComplete) {
      setAwaitingStreamAi(false);
      return;
    }
    const last = messages[messages.length - 1];
    if (!last || last.type === 'ai' || isPlayingAudio) {
      setAwaitingStreamAi(false);
      return;
    }
    if (last.type !== 'user') {
      setAwaitingStreamAi(false);
      return;
    }
    if (last.content === USER_TRANSCRIPT_PENDING_LABEL) {
      setAwaitingStreamAi(false);
      return;
    }
    if (isSubmitting) {
      setAwaitingStreamAi(false);
      return;
    }
    setAwaitingStreamAi(true);
  }, [messages, isSubmitting, isPlayingAudio, isComplete]);

  useEffect(() => {
    if (!sessionId) return;
    try {
      const { close } = connectToInterviewStream(sessionId, {
        onStatusUpdate: (s) => {
          setStatus(s);
          // Don’t rely only on ai_response payload (message/audio): if the client connects
          // after the server already moved to waiting_for_response, we’d never clear the join gate.
          if (s === 'ai_responded' || s === 'waiting_for_response') {
            setGleeJoined(true);
          }
        },
        onTranscript: (raw) => {
          const text = typeof raw === 'string' ? raw.trim() : '';
          if (!text) return;
          if (appendStreamUserTranscriptRef && !appendStreamUserTranscriptRef.current) return;
          addUserMessage(text);
        },
        onAIResponse: (data: AIResponseData) => {
          if ((data.message && data.message.trim()) || data.audioBase64) {
            setGleeJoined(true);
          }
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
        onError: (msg) => {
          console.warn(ERROR_LOG_PREFIX, 'stream onError:', msg);
          setError((e) => (e ? e : msg));
        },
      });
      streamCloseRef.current = close;
      return () => {
        close();
        streamCloseRef.current = null;
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      console.warn(ERROR_LOG_PREFIX, 'connectToInterviewStream catch:', message, err);
      setError(message);
      setStatus('error');
    }
  }, [sessionId, addAIMessage, enqueueAudio, addUserMessage, appendStreamUserTranscriptRef]);

  const submitText = useCallback(
    async (text: string) => {
      if (!text.trim() || isSubmitting) return;
      const trimmed = text.trim();
      setIsSubmitting(true);
      setError(null);
      addUserMessage(trimmed);
      try {
        const { taskId } = await submitResponse({
          sessionId,
          textResponse: trimmed,
        });
        let attempts = 0;
        const poll = async (): Promise<void> => {
          if (attempts >= MAX_POLL_ATTEMPTS) {
            console.warn(ERROR_LOG_PREFIX, 'submitText poll timeout');
            setError('Response timeout');
            setUserLineCommitted(false);
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
            setUserLineCommitted(false);
            setIsSubmitting(false);
            return;
          }
          if (res?.status === 'failed') {
            const errMsg = res?.error ?? 'Response failed';
            console.warn(ERROR_LOG_PREFIX, 'submitText poll failed:', errMsg, res);
            setError(errMsg);
            setUserLineCommitted(false);
            setIsSubmitting(false);
            return;
          }
          setTimeout(poll, POLL_INTERVAL_MS);
        };
        await poll();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit';
        console.warn(ERROR_LOG_PREFIX, 'submitText catch:', message, err);
        setError(message);
        setUserLineCommitted(false);
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, addUserMessage, addAIMessage]
  );

  const submitAudio = useCallback(
    async (audio: Blob) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setUserLineCommitted(false);
      pushPendingUserLine();
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
            console.warn(ERROR_LOG_PREFIX, 'submitAudio poll timeout');
            setError('Response timeout');
            stripPendingUserLine();
            setUserLineCommitted(false);
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
            // Do not enqueue audio here — stream already delivers the same AI response + audio; playing both causes Glee to speak twice
            const ia = res?.interview_ai_response;
            if (ia?.last_node != null) setLastNode(ia.last_node);
            if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
            setUserLineCommitted(false);
            setIsSubmitting(false);
            return;
          }
          if (res?.status === 'failed') {
            const errMsg = res?.error ?? 'Response failed';
            console.warn(ERROR_LOG_PREFIX, 'submitAudio poll failed:', errMsg, res);
            setError(errMsg);
            stripPendingUserLine();
            setUserLineCommitted(false);
            setIsSubmitting(false);
            return;
          }
          setTimeout(poll, POLL_INTERVAL_MS);
        };
        await poll();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit audio';
        console.warn(ERROR_LOG_PREFIX, 'submitAudio catch:', message, err);
        setError(message);
        stripPendingUserLine();
        setUserLineCommitted(false);
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, addUserMessage, addAIMessage, pushPendingUserLine, stripPendingUserLine]
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
            console.warn(ERROR_LOG_PREFIX, 'submitCode poll timeout');
            setError('Response timeout');
            setUserLineCommitted(false);
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
            // Do not enqueue audio here — stream already delivers the same AI response + audio; playing both causes Glee to speak twice
            const ia = res?.interview_ai_response;
            if (ia?.last_node != null) setLastNode(ia.last_node);
            if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
            setUserLineCommitted(false);
            setIsSubmitting(false);
            return;
          }
          if (res?.status === 'failed') {
            const errMsg = res?.error ?? 'Response failed';
            console.warn(ERROR_LOG_PREFIX, 'submitCode poll failed:', errMsg, res);
            setError(errMsg);
            setUserLineCommitted(false);
            setIsSubmitting(false);
            return;
          }
          setTimeout(poll, POLL_INTERVAL_MS);
        };
        await poll();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit code';
        console.warn(ERROR_LOG_PREFIX, 'submitCode catch:', message, err);
        setError(message);
        setUserLineCommitted(false);
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, addUserMessage, addAIMessage]
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
    gleeHasJoined: gleeJoined,
    gleeJoinWaitTimedOut,
    bypassGleeJoinGate,
    userTranscriptVisibleThisTurn: userLineCommitted,
    awaitingStreamAi,
    addUserMessage,
    submitText,
    submitAudio,
    submitCode,
    endSession,
    updateCommunicationData: setCommunicationData,
  };
}
