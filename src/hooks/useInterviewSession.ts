import { useState, useRef, useCallback, useEffect, type MutableRefObject } from 'react';
import {
  connectToInterviewStream,
  submitResponse,
  getRespondTaskStatus,
  endInterview,
} from '../services/interviewService';
import { nestClient } from '../api/axiosInstance';
import { CREDIT_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  AIResponseData,
  RespondTaskResult,
  CommunicationData,
  InterviewAIResponsePayload,
  RespondCompleteSsePayload,
} from '../types/interview';
import { USER_TRANSCRIPT_PENDING_LABEL } from '../constants/interviewSessionUi';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120;
/** If `respond_complete` SSE is not received (legacy API), fall back to polling respond-status. */
const RESPOND_SSE_FALLBACK_MS = 12_000;
/** Deduct credits after interview has been live for this long. */
const CREDIT_DEDUCTION_DELAY_MS = 120_000;

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
  /** UUID of the interview test — used for credit deduction after 2 minutes. */
  interviewTestId?: string;
  /**
   * When `.current` is false at event time, SSE user transcripts are not appended
   * (matches legacy Communication interview: hide STT in main chat during structured rounds).
   */
  appendStreamUserTranscriptRef?: MutableRefObject<boolean>;
  /**
   * Dev mode: text-only flow — skip Glee join gate, do not play SSE TTS, send skip_audio on responds.
   */
  devMode?: boolean;
  /**
   * Latest code editor contents; appended as `code_input` on every text/audio respond (legacy landing behavior).
   */
  respondCodeRef?: MutableRefObject<string>;
  /** Called when SSE delivers `feedback_complete` after POST /end (optional; poll remains as fallback). */
  onFeedbackReady?: () => void;
}

export type EndSessionOpts = { sessionFinished?: boolean; interviewTestId?: string | number };

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
  interviewTestId,
  appendStreamUserTranscriptRef,
  devMode = false,
  respondCodeRef,
  onFeedbackReady,
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
  const pendingRespondTaskIdRef = useRef<string | null>(null);
  const lastSubmitWasAudioRef = useRef(false);
  const respondFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRespondTurnRef = useRef<(() => void) | null>(null);
  const streamBridgeRef = useRef({
    onRespondComplete: (_p: RespondCompleteSsePayload) => {},
    onRespondFailed: (_d: { task_id?: string; error?: string }) => {},
    onFeedbackReady: () => {},
  });
  const prevSessionIdRef = useRef<string | undefined>(undefined);
  const startTimeRef = useRef(Date.now());
  /** Prevents double-deduction if the component remounts while the timer is still pending. */
  const creditDeductedRef = useRef(false);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const blockedAudioRef = useRef<string | null>(null);
  const devModeRef = useRef(devMode);
  devModeRef.current = devMode;

  const codeInputSnapshot = (): string | undefined => {
    const raw = respondCodeRef?.current;
    const t = typeof raw === 'string' ? raw.trim() : '';
    return t || undefined;
  };

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

  const clearRespondFallbackTimer = useCallback(() => {
    if (respondFallbackTimerRef.current != null) {
      clearTimeout(respondFallbackTimerRef.current);
      respondFallbackTimerRef.current = null;
    }
  }, []);

  const applyFromRespondResult = useCallback(
    (res: RespondTaskResult | RespondCompleteSsePayload) => {
      clearRespondFallbackTimer();
      pendingRespondTaskIdRef.current = null;
      const msg = extractMessage(res);
      if (res.interview_transcript?.trim()) addUserMessage(res.interview_transcript);
      if (msg != null) {
        setAiMessage(msg);
        addAIMessage(msg);
      }
      const ia = res.interview_ai_response;
      if (ia?.last_node != null) setLastNode(ia.last_node);
      if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
      setUserLineCommitted(false);
      setIsSubmitting(false);
      completeRespondTurnRef.current?.();
      completeRespondTurnRef.current = null;
    },
    [addUserMessage, addAIMessage, clearRespondFallbackTimer]
  );

  const pollRespondUntilResolved = useCallback(
    async (taskId: string, isAudio: boolean) => {
      let attempts = 0;
      const loop = async (): Promise<void> => {
        if (pendingRespondTaskIdRef.current !== taskId) return;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          console.warn(ERROR_LOG_PREFIX, 'respond fallback poll timeout');
          setError('Response timeout');
          pendingRespondTaskIdRef.current = null;
          clearRespondFallbackTimer();
          setUserLineCommitted(false);
          setIsSubmitting(false);
          completeRespondTurnRef.current?.();
          completeRespondTurnRef.current = null;
          if (isAudio) stripPendingUserLine();
          return;
        }
        attempts++;
        try {
          const res = (await getRespondTaskStatus(sessionId, taskId)) as RespondTaskResult;
          if (pendingRespondTaskIdRef.current !== taskId) return;
          if (res?.status === 'completed') {
            lastSubmitWasAudioRef.current = false;
            applyFromRespondResult(res);
            return;
          }
          if (res?.status === 'failed') {
            const errMsg = res?.error ?? 'Response failed';
            console.warn(ERROR_LOG_PREFIX, 'respond fallback poll failed:', errMsg, res);
            setError(errMsg);
            pendingRespondTaskIdRef.current = null;
            clearRespondFallbackTimer();
            setUserLineCommitted(false);
            setIsSubmitting(false);
            completeRespondTurnRef.current?.();
            completeRespondTurnRef.current = null;
            if (isAudio) stripPendingUserLine();
            return;
          }
          setTimeout(loop, POLL_INTERVAL_MS);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to get response status';
          console.warn(ERROR_LOG_PREFIX, 'respond fallback catch:', message, err);
          setError(message);
          pendingRespondTaskIdRef.current = null;
          clearRespondFallbackTimer();
          setUserLineCommitted(false);
          setIsSubmitting(false);
          completeRespondTurnRef.current?.();
          completeRespondTurnRef.current = null;
          if (isAudio) stripPendingUserLine();
        }
      };
      await loop();
    },
    [sessionId, applyFromRespondResult, clearRespondFallbackTimer, stripPendingUserLine]
  );

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
      if (devModeRef.current) {
        if (base64) setGleeJoined(true);
        return;
      }
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
    setGleeJoined(Boolean(devModeRef.current));
    setGleeJoinWaitTimedOut(false);
    setUserLineCommitted(false);
    setAwaitingStreamAi(false);
    setStatus('connecting');
    setError(null);
    pendingRespondTaskIdRef.current = null;
    clearRespondFallbackTimer();
    completeRespondTurnRef.current = null;
    creditDeductedRef.current = false;
  }, [sessionId, clearRespondFallbackTimer]);

  useEffect(() => {
    return () => clearRespondFallbackTimer();
  }, [clearRespondFallbackTimer]);

  useEffect(() => {
    if (!sessionId || !devMode) return;
    setGleeJoined(true);
    setGleeJoinWaitTimedOut(false);
  }, [sessionId, devMode]);

  useEffect(() => {
    if (!sessionId || gleeJoined) return;
    const t = window.setTimeout(() => setGleeJoinWaitTimedOut(true), 75_000);
    return () => window.clearTimeout(t);
  }, [sessionId, gleeJoined]);

  // Start the 2-minute credit deduction timer once the interview is confirmed live (gleeJoined).
  // Deduction is skipped if the interview ends before 2 minutes.
  useEffect(() => {
    if (!sessionId || !interviewTestId || !gleeJoined || creditDeductedRef.current) return;
    const t = window.setTimeout(() => {
      if (creditDeductedRef.current) return;
      creditDeductedRef.current = true;
      nestClient
        .post(CREDIT_ENDPOINTS.DEDUCT_FOR_INTERVIEW, { interviewTestId, sessionId })
        .catch((err) => {
          console.warn('[useInterviewSession] credit deduction failed:', err);
        });
    }, CREDIT_DEDUCTION_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [sessionId, interviewTestId, gleeJoined]);

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

  streamBridgeRef.current.onRespondComplete = (payload) => {
    const tid = payload.task_id ?? '';
    const pending = pendingRespondTaskIdRef.current;
    if (pending && tid && tid !== pending) return;
    if (!pending) {
      const ia = payload.interview_ai_response;
      if (ia) setCommunicationData((prev) => mergeCommunicationFromResponse(prev, ia));
      if (ia?.last_node != null) setLastNode(ia.last_node);
      return;
    }
    lastSubmitWasAudioRef.current = false;
    applyFromRespondResult(payload);
  };

  streamBridgeRef.current.onRespondFailed = (d) => {
    if (!pendingRespondTaskIdRef.current) return;
    const isAudio = lastSubmitWasAudioRef.current;
    lastSubmitWasAudioRef.current = false;
    pendingRespondTaskIdRef.current = null;
    clearRespondFallbackTimer();
    const errMsg = d.error ?? 'Response failed';
    console.warn(ERROR_LOG_PREFIX, 'SSE respond_failed:', errMsg, d);
    setError(errMsg);
    setUserLineCommitted(false);
    setIsSubmitting(false);
    completeRespondTurnRef.current?.();
    completeRespondTurnRef.current = null;
    if (isAudio) stripPendingUserLine();
  };

  streamBridgeRef.current.onFeedbackReady = () => {
    onFeedbackReady?.();
  };

  useEffect(() => {
    if (!sessionId) return;
    try {
      const { close } = connectToInterviewStream(sessionId, {
        onRespondComplete: (p) => streamBridgeRef.current.onRespondComplete(p),
        onRespondFailed: (d) => streamBridgeRef.current.onRespondFailed(d),
        onFeedbackComplete: () => streamBridgeRef.current.onFeedbackReady(),
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
          const hadPendingRespond = pendingRespondTaskIdRef.current != null;
          if ((data.message && data.message.trim()) || data.audioBase64) {
            setGleeJoined(true);
          }
          if (data.message != null) {
            setAiMessage(data.message);
            addAIMessage(data.message);
          }
          if (data.audioBase64) enqueueAudio(data.audioBase64);
          if (data.lastNode != null) setLastNode(data.lastNode);
          if (hadPendingRespond) {
            pendingRespondTaskIdRef.current = null;
            clearRespondFallbackTimer();
            setUserLineCommitted(false);
            setIsSubmitting(false);
            completeRespondTurnRef.current?.();
            completeRespondTurnRef.current = null;
          }
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
  }, [sessionId, addAIMessage, enqueueAudio, addUserMessage, appendStreamUserTranscriptRef, clearRespondFallbackTimer]);

  const submitText = useCallback(
    async (text: string) => {
      if (!text.trim() || isSubmitting) return;
      let settled = false;
      const turnDone = new Promise<void>((resolve) => {
        completeRespondTurnRef.current = () => {
          if (settled) return;
          settled = true;
          completeRespondTurnRef.current = null;
          resolve();
        };
      });
      const trimmed = text.trim();
      setIsSubmitting(true);
      setError(null);
      addUserMessage(trimmed);
      try {
        const { taskId } = await submitResponse({
          sessionId,
          textResponse: trimmed,
          codeInput: codeInputSnapshot(),
          skipAudio: devModeRef.current,
        });
        lastSubmitWasAudioRef.current = false;
        clearRespondFallbackTimer();
        pendingRespondTaskIdRef.current = taskId;
        respondFallbackTimerRef.current = window.setTimeout(() => {
          respondFallbackTimerRef.current = null;
          if (pendingRespondTaskIdRef.current !== taskId) return;
          void pollRespondUntilResolved(taskId, false);
        }, RESPOND_SSE_FALLBACK_MS);
        await turnDone;
      } catch (err) {
        if (!settled) {
          settled = true;
          completeRespondTurnRef.current = null;
        }
        pendingRespondTaskIdRef.current = null;
        clearRespondFallbackTimer();
        const message = err instanceof Error ? err.message : 'Failed to submit';
        console.warn(ERROR_LOG_PREFIX, 'submitText catch:', message, err);
        setError(message);
        setUserLineCommitted(false);
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, addUserMessage, pollRespondUntilResolved, clearRespondFallbackTimer]
  );

  const submitAudio = useCallback(
    async (audio: Blob) => {
      if (isSubmitting) return;
      let settled = false;
      const turnDone = new Promise<void>((resolve) => {
        completeRespondTurnRef.current = () => {
          if (settled) return;
          settled = true;
          completeRespondTurnRef.current = null;
          resolve();
        };
      });
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
          codeInput: codeInputSnapshot(),
          skipAudio: devModeRef.current,
        });
        lastSubmitWasAudioRef.current = true;
        clearRespondFallbackTimer();
        pendingRespondTaskIdRef.current = taskId;
        respondFallbackTimerRef.current = window.setTimeout(() => {
          respondFallbackTimerRef.current = null;
          if (pendingRespondTaskIdRef.current !== taskId) return;
          void pollRespondUntilResolved(taskId, true);
        }, RESPOND_SSE_FALLBACK_MS);
        await turnDone;
      } catch (err) {
        if (!settled) {
          settled = true;
          completeRespondTurnRef.current = null;
        }
        pendingRespondTaskIdRef.current = null;
        clearRespondFallbackTimer();
        const message = err instanceof Error ? err.message : 'Failed to submit audio';
        console.warn(ERROR_LOG_PREFIX, 'submitAudio catch:', message, err);
        setError(message);
        stripPendingUserLine();
        setUserLineCommitted(false);
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, pushPendingUserLine, stripPendingUserLine, pollRespondUntilResolved, clearRespondFallbackTimer]
  );

  const submitCode = useCallback(
    async (code: string) => {
      if (!code.trim() || isSubmitting) return;
      let settled = false;
      const turnDone = new Promise<void>((resolve) => {
        completeRespondTurnRef.current = () => {
          if (settled) return;
          settled = true;
          completeRespondTurnRef.current = null;
          resolve();
        };
      });
      setIsSubmitting(true);
      setError(null);
      try {
        const { taskId } = await submitResponse({
          sessionId,
          codeInput: code,
        });
        lastSubmitWasAudioRef.current = false;
        clearRespondFallbackTimer();
        pendingRespondTaskIdRef.current = taskId;
        respondFallbackTimerRef.current = window.setTimeout(() => {
          respondFallbackTimerRef.current = null;
          if (pendingRespondTaskIdRef.current !== taskId) return;
          void pollRespondUntilResolved(taskId, false);
        }, RESPOND_SSE_FALLBACK_MS);
        await turnDone;
      } catch (err) {
        if (!settled) {
          settled = true;
          completeRespondTurnRef.current = null;
        }
        pendingRespondTaskIdRef.current = null;
        clearRespondFallbackTimer();
        const message = err instanceof Error ? err.message : 'Failed to submit code';
        console.warn(ERROR_LOG_PREFIX, 'submitCode catch:', message, err);
        setError(message);
        setUserLineCommitted(false);
        setIsSubmitting(false);
      }
    },
    [sessionId, isSubmitting, pollRespondUntilResolved, clearRespondFallbackTimer]
  );

  const endSession = useCallback(
    async (opts?: EndSessionOpts): Promise<string | null> => {
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
