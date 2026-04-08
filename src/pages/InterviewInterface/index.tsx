import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearInterviewAccessToken } from '../../api/axiosInstance';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { usePlanStatus } from '../../hooks/usePlanStatus';
import { useUtteranceHold } from '../../hooks/useUtteranceHold';
import { getInterviewFeedbackStatus } from '../../services/interviewService';
import { float32ToWavBlob } from '../../utils/blobToWav';
import { useMicVAD } from '@ricky0123/vad-react';
import CodeEditorPanel from './components/CodeEditorPanel';
import CaseStudyPanel from './components/CaseStudyPanel';
import { SpeakingPhase, ComprehensionPhase, MCQPhase, MCQResults } from './components/Communication';
import InterviewHeader from './components/InterviewHeader';
import EndInterviewModal from './components/EndInterviewModal';
import TranscriptPanel from './components/TranscriptPanel';
import MicWaveform from './components/MicWaveform';
import { ROUTES } from '../../constants/routerConstants';
import { USER_TRANSCRIPT_PENDING_LABEL } from '../../constants/interviewSessionUi';
import { useInterviewDevMode } from '../../context/InterviewDevModeContext';
import { interviewDevToolsVisible } from '../../constants/interviewDevTools';
import { useInterviewAnalysis } from '../../experimental/hooks/useInterviewAnalysis';
import './InterviewInterface.css';

const FEEDBACK_POLL_INTERVAL_MS = 2000;
const FEEDBACK_POLL_MAX_ATTEMPTS = 45;

/** Phases where legacy app hid user STT in the main transcript (phase-specific UI instead). */
const COMMUNICATION_TRANSCRIPT_SUPPRESSED_PHASES = new Set([
  'Speaking',
  'Speaking_after',
  'Comprehension',
  'Comprehension_before',
  'Comprehension_after',
  'MCQ',
  'MCQ_after',
]);

export default function InterviewInterface() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    sessionId?: string;
    interviewType?: string;
    interviewTypeId?: string;
  } | null;
  const sessionId = state?.sessionId;
  const interviewType = state?.interviewType ?? 'Technical';
  const interviewTypeId = state?.interviewTypeId;

  const [showEndModal, setShowEndModal] = useState(false);
  const { devMode, toggleDevMode } = useInterviewDevMode();
  const [devModeDraft, setDevModeDraft] = useState('');

  useEffect(() => { 
    
    return () => clearInterviewAccessToken()}, []);
  
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [endTaskId, setEndTaskId] = useState<string | null>(null);
  const appendStreamUserTranscriptRef = useRef(true);
  /** Latest code tab contents; sent as `code_input` on each voice/text respond (legacy landing behavior). */
  const respondCodeRef = useRef('');
  const [codeEditorValue, setCodeEditorValue] = useState('');
  useEffect(() => {
    respondCodeRef.current = codeEditorValue;
  }, [codeEditorValue]);
  const hasNavigatedToFeedbackRef = useRef(false);
  /** True when user clicked End and we're waiting for feedback task — don't navigate until poll completes */
  const waitingForFeedbackRef = useRef(false);

  const onInterviewFeedbackReady = useCallback(() => {
    if (!sessionId) return;
    setEndTaskId(null);
    setShowEndModal(false);
    waitingForFeedbackRef.current = false;
    hasNavigatedToFeedbackRef.current = true;
    navigate(ROUTES.FEEDBACK, {
      replace: true,
      state: {
        type: 'video-interview',
        session_id: sessionId,
        session_type: interviewType,
      },
    });
  }, [navigate, sessionId, interviewType]);


  

  const {
    aiMessage,
    messages,
    lastNode,
    communicationData,
    status,
    isComplete,
    error,
    isSubmitting,
    isPlayingAudio,
    gleeHasJoined,
    gleeJoinWaitTimedOut,
    bypassGleeJoinGate,
    awaitingStreamAi,
    submitText,
    submitAudio,
    endSession,
    updateCommunicationData,
  } = useInterviewSession({
    sessionId: sessionId ?? '',
    interviewType,
    interviewTestId: interviewTypeId,
    appendStreamUserTranscriptRef,
    devMode,
    respondCodeRef,
    onFeedbackReady: onInterviewFeedbackReady,
  });
  const { videoRef, audioEnabled, getStream, streamReady } = useMediaDevices();
  // Video telemetry: filter console for `[InterviewVideoTelemetry]` (on in dev; set `debugVideoTelemetry: true` for prod tracing).
  const { startAnalysis, stopAnalysis, speechRef } = useInterviewAnalysis({
    videoTelemetrySessionId: sessionId ?? null,
    micEnabled: audioEnabled,
    exposeTelemetryIntervalDebug: true,
  });
  const allowVadSendRef = useRef(true);
  /** Ignore VAD submissions briefly after AI audio ends (avoids echo/noise firing submitAudio → false "processing"). */
  const postAiListenGateUntilRef = useRef(0);
  const prevIsPlayingAudioRef = useRef(false);
  const limitWarnedRef = useRef(false);
  const limitAutoEndRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'code' | 'notes'>('conversation');
  const [notes, setNotes] = useState('');
  const [caseStudyQuestion, setCaseStudyQuestion] = useState<string | null>(null);
  const { planStatus } = usePlanStatus();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [autoEnded, setAutoEnded] = useState(false);

  const isCodeInterview =
    interviewType === 'technical' ||
    interviewType === 'coding' ||
    interviewType === 'role-based' ||
    interviewType === 'company' ||
    interviewType === 'subject';

  const isCaseStudy = interviewType === 'case-study';
  const isCommunication = interviewType === 'miscellaneous'; // TODO: This is a temporary solution due to the backend setup and avoiding tampering a lot of apis, will fix this later as this is an issue avoiding us to add any further miscellaneous interview types.

  useEffect(() => {
    console.log('[sessionId changed]', sessionId);
  }, [sessionId]);
  
  useEffect(() => {
    if (!sessionId) {
      console.log('[InterviewInterface] sessionId is falsy — would navigate away', {
        locationState: location.state,
        locationSearch: location.search,
      });
      // navigate(ROUTES.VIDEO_INTERVIEW, { replace: true }); // temporarily comment out
    }
  }, [sessionId, navigate]);

  // Capture case study question when AI sends it (lastNode === 'CaseStudy')
  useEffect(() => {
    if (isCaseStudy && lastNode === 'CaseStudy' && aiMessage && !caseStudyQuestion) {
      setCaseStudyQuestion(aiMessage);
    }
  }, [isCaseStudy, lastNode, aiMessage, caseStudyQuestion]);

  useEffect(() => {
    if (prevIsPlayingAudioRef.current === true && isPlayingAudio === false) {
      // Glee just finished — VAD is about to reinitialize with a new AudioContext
      // Web Speech needs to restart to reattach to whatever stream VAD now owns
      const t = window.setTimeout(() => {
        speechRef?.forceRestartRecognition();
      }, 1000); // wait for VAD to finish reinitializing
      return () => clearTimeout(t);
    }
    prevIsPlayingAudioRef.current = isPlayingAudio;
  }, [isPlayingAudio]);
  // Communication: send text or audio via existing submit methods
  const sendCommunicationResponse = useCallback(
    async (payload: { textResponse?: string; audioData?: string; sampleRate?: number }) => {
      if (payload.textResponse != null) await submitText(payload.textResponse);
      if (payload.audioData != null) {
        const blob = await fetch(`data:audio/wav;base64,${payload.audioData}`).then((r) => r.blob());
        await submitAudio(blob);
      }
    },
    [submitText, submitAudio]
  );

  // Derive communication phase for UI (don't override to Results if we're already there)
  const communicationPhase =
    lastNode === 'Results' || communicationData.mcqResults?.length
      ? 'Results'
      : lastNode ?? null;
  const showCommunicationPhaseUI =
    isCommunication &&
    communicationPhase &&
    ['Speaking', 'Speaking_after', 'Comprehension', 'Comprehension_before', 'Comprehension_after', 'MCQ', 'MCQ_after', 'Results'].includes(communicationPhase);

  // During Communication Speaking exercise (paragraph shown, no feedback yet), user must use record button — don't auto-send VAD
  const isCommunicationSpeakingExercise =
    isCommunication &&
    (communicationPhase === 'Speaking' || communicationPhase === 'Speaking_after') &&
    !!communicationData.speaking &&
    !communicationData.speakingFeedback;
  allowVadSendRef.current = !isCommunicationSpeakingExercise && !devMode;

  useEffect(() => {
    if (prevIsPlayingAudioRef.current && !isPlayingAudio) {
      postAiListenGateUntilRef.current = Date.now() + 700;
    }
    prevIsPlayingAudioRef.current = isPlayingAudio;
  }, [isPlayingAudio]);

  useEffect(() => {
    if (!isCommunication || !communicationPhase) {
      appendStreamUserTranscriptRef.current = true;
      return;
    }
    const inStructuredRound = COMMUNICATION_TRANSCRIPT_SUPPRESSED_PHASES.has(communicationPhase);
    const afterSpeakingFeedback =
      communicationPhase === 'Speaking' && Boolean(communicationData.speakingFeedback);
    appendStreamUserTranscriptRef.current = !inStructuredRound || afterSpeakingFeedback;
  }, [isCommunication, communicationPhase, communicationData.speakingFeedback]);

  const vad = useMicVAD({
    startOnLoad: false,
    getStream: streamReady ? 
              getStream : () => Promise.resolve(new MediaStream()),
    // Don't stop tracks on pause — we use the same stream for camera/mic level. VAD just disconnects.
    pauseStream: async () => {},
    resumeStream: async (stream: MediaStream) => stream,
    onSpeechEnd: (audio: Float32Array) => {
      console.log('[onSpeechEnd] audio ended', {
        allowVadSendRef: allowVadSendRef.current,
        postAiListenGateUntilRef: postAiListenGateUntilRef.current,
      });
      if (!allowVadSendRef.current) return;
      if (Date.now() < postAiListenGateUntilRef.current) return;
      const blob = float32ToWavBlob(audio, 16000);
      void submitAudio(blob);
    },
    positiveSpeechThreshold: 0.6,
    negativeSpeechThreshold: 0.4,
    redemptionMs: 1400,
    minSpeechMs: 400,
    baseAssetPath: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/',
    onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/',
  });

  // Pause VAD while Glee speaks or we're awaiting the backend; resume after a short post-AI gate against echo.
  useEffect(() => {
    if (isComplete) {
      vad.pause();
      return;
    }
    if (vad.loading) return;

    if (devMode) {
      vad.pause();
      return;
    }

    if (
      !audioEnabled ||
      isPlayingAudio ||
      isSubmitting ||
      awaitingStreamAi ||
      (!gleeHasJoined && !isComplete)
    ) {
      vad.pause();
      return;
    }

    const gateWait = Math.max(0, postAiListenGateUntilRef.current - Date.now());
    const startListening = () => {
      void getStream()
        .then((stream) => {
          if (stream?.active) void vad.start();
        })
        .catch(() => {});
    };

    if (gateWait <= 0) {
      startListening();
      return;
    }

    const t = window.setTimeout(startListening, gateWait);
    return () => clearTimeout(t);
  }, [
    devMode,
    audioEnabled,
    isPlayingAudio,
    isSubmitting,
    awaitingStreamAi,
    gleeHasJoined,
    isComplete,
    vad.loading,
    getStream,
    vad,
  ]);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastIsTranscribingPlaceholder =
    lastMessage?.type === 'user' && lastMessage.content === USER_TRANSCRIPT_PENDING_LABEL;
  const showGleeProcessingSidebar =
    !isPlayingAudio &&
    !lastIsTranscribingPlaceholder &&
    ((isSubmitting && lastMessage?.type === 'user') || awaitingStreamAi);

  /** Block main interview until first SSE from Glee (or connection error). */
  const showGleeJoinOverlay =
    Boolean(sessionId) && !isComplete && !gleeHasJoined && !error && !devMode;

  // When it's clearly the user's turn: session active, mic on, VAD ready, AI not speaking, not submitting
  const isUserTurnToSpeak =
    !isComplete &&
    !isSubmitting &&
    !awaitingStreamAi &&
    gleeHasJoined &&
    !isCommunicationSpeakingExercise &&
    (devMode ? true : !vad.loading && audioEnabled && !isPlayingAudio);

  const utteranceHold = useUtteranceHold(vad.userSpeaking, 480);
  const displayUserSpeaking =
    !devMode && utteranceHold && !isSubmitting && !isPlayingAudio;


  useEffect(() => {
    console.log('[VAD pause effect]', {
      isComplete,
      vadLoading: vad.loading,
      devMode,
      audioEnabled,
      isPlayingAudio,
      isSubmitting,
      awaitingStreamAi,
      gleeHasJoined,
      willPause: !audioEnabled || isPlayingAudio || isSubmitting || awaitingStreamAi || (!gleeHasJoined && !isComplete),
    });
  }, [isComplete, vad.loading, devMode, audioEnabled, isPlayingAudio, isSubmitting, awaitingStreamAi, gleeHasJoined]);

  useEffect(() => {
    console.log('[gleeHasJoined changed]', gleeHasJoined);
  }, [gleeHasJoined]);
  useEffect(() => {
    if (!streamReady) return;
    if (!sessionId || isComplete) return;

    let cancelled = false;

    void (async () => {
      try {
        const stream = await getStream();
        const video = videoRef.current;
        if (!stream || !video || cancelled) return;

        await new Promise<void>((resolve) => {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            resolve();
            return;
          }
          const onReady = () => resolve();
          video.addEventListener('loadeddata', onReady, { once: true });
          window.setTimeout(onReady, 2500);
        });

        if (cancelled) return;
        await startAnalysis(video, stream);
      } catch (err) {
        console.warn('[InterviewInterface] interview analysis failed to start', err);
      }
    })();

    return () => {
      cancelled = true;
      void stopAnalysis();
    };
  }, [sessionId, streamReady, isComplete, getStream, videoRef, startAnalysis, stopAnalysis]);

  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.VIDEO_INTERVIEW, { replace: true });
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    limitWarnedRef.current = false;
    limitAutoEndRef.current = false;
    setAutoEnded(false);
    setShowTimeWarning(false);
  }, [sessionId]);

  // Elapsed clock for all interviews; free-tier cap only when plan reports a time limit.
  useEffect(() => {
    if (!sessionId || isComplete) return;
    const key = `interview_session_started_${sessionId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, String(Date.now()));
    }

    const tick = () => {
      const raw = sessionStorage.getItem(key);
      const startTs = raw ? Number(raw) : NaN;
      const t0 = Number.isFinite(startTs) ? startTs : Date.now();
      const elapsed = Math.floor((Date.now() - t0) / 1000);
      setElapsedSeconds(elapsed);

      if (planStatus?.has_time_limit) {
        if (elapsed >= 300 && !limitWarnedRef.current) {
          limitWarnedRef.current = true;
          setShowTimeWarning(true);
        }
        if (elapsed >= 600 && !limitAutoEndRef.current) {
          limitAutoEndRef.current = true;
          setShowTimeWarning(false);
          setAutoEnded(true);
          sessionStorage.removeItem(key);
          void endSession({ sessionFinished: true, interviewTestId: interviewTypeId });
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionId, isComplete, planStatus?.has_time_limit, endSession, interviewTypeId]);

  const exportTranscript = useCallback(() => {
    const lines = messages.map((m) =>
      `[${m.timestamp.toLocaleTimeString()}] ${m.type === 'ai' ? 'Interviewer' : 'You'}: ${m.content}`
    );
    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  const handleEndClick = useCallback(() => {
    setShowEndModal(true);
  }, []);

  const handleEndConfirm = useCallback(async () => {
    waitingForFeedbackRef.current = true;
    setIsEndingInterview(true);
    try {
      const taskId = await endSession({ sessionFinished: true, interviewTestId: interviewTypeId });
      if (taskId) setEndTaskId(taskId);
      else {
        waitingForFeedbackRef.current = false;
        setShowEndModal(false);
      }
    } catch {
      waitingForFeedbackRef.current = false;
      setShowEndModal(false);
      setIsEndingInterview(false);
      return;
    }
    setIsEndingInterview(false);
  }, [endSession, interviewTypeId]);

  // When session ends: if we're waiting for feedback (End button), poll effect will navigate; else navigate now
  useEffect(() => {
    if (!isComplete || !sessionId || hasNavigatedToFeedbackRef.current) return;
    if (waitingForFeedbackRef.current || endTaskId) return; // wait for feedback poll to finish
    hasNavigatedToFeedbackRef.current = true;
    navigate(ROUTES.FEEDBACK, {
      replace: true,
      state: {
        type: 'video-interview',
        session_id: sessionId,
        session_type: interviewType,
      },
    });
  }, [isComplete, sessionId, interviewType, endTaskId, navigate]);

  // Poll feedback task after manual End until completed/failed, then navigate (loader stays on interview page)
  useEffect(() => {
    if (!endTaskId || !sessionId || hasNavigatedToFeedbackRef.current) return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      if (hasNavigatedToFeedbackRef.current) return;
      if (cancelled || attempts >= FEEDBACK_POLL_MAX_ATTEMPTS) {
        setEndTaskId(null);
        setShowEndModal(false);
        waitingForFeedbackRef.current = false;
        hasNavigatedToFeedbackRef.current = true;
        navigate(ROUTES.FEEDBACK, { replace: true, state: { type: 'video-interview', session_id: sessionId, session_type: interviewType } });
        return;
      }
      attempts++;
      try {
        const res = await getInterviewFeedbackStatus(endTaskId);
        if (res.status === 'completed' || res.status === 'failed') {
          setEndTaskId(null);
          setShowEndModal(false);
          waitingForFeedbackRef.current = false;
          hasNavigatedToFeedbackRef.current = true;
          navigate(ROUTES.FEEDBACK, { replace: true, state: { type: 'video-interview', session_id: sessionId, session_type: interviewType } });
          return;
        }
      } catch {
        // ignore, retry
      }
      setTimeout(poll, FEEDBACK_POLL_INTERVAL_MS);
    };
    poll(); // first check immediately, then retry after interval
    return () => { cancelled = true; };
  }, [endTaskId, sessionId, interviewType, navigate]);

  const handleDevModeSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const t = devModeDraft.trim();
      if (!t || isSubmitting) return;
      void submitText(t).then(() => setDevModeDraft(''));
    },
    [devModeDraft, isSubmitting, submitText]
  );

  return (
    <div className="interview-interface">
      <InterviewHeader
          elapsedSeconds={elapsedSeconds}
          onExportTranscript={messages.length > 0 ? exportTranscript : undefined}
          onEndClick={handleEndClick}
          isEnding={isEndingInterview}
          isComplete={isComplete}
          showDevModeControls={interviewDevToolsVisible}
          devMode={devMode}
          onDevModeToggle={() => toggleDevMode()}
        />
      <EndInterviewModal
        open={showEndModal}
        onClose={() => !endTaskId && setShowEndModal(false)}
        onConfirm={handleEndConfirm}
        isEnding={isEndingInterview}
        isPreparingFeedback={!!endTaskId}
      />
      <div className="interview-interface__body-with-overlay">
        {showGleeJoinOverlay && (
          <div className="interview-interface__join-overlay" role="status" aria-live="polite">
            <div className="interview-interface__join-overlay-inner">
              <span className="interview-interface__vad-spinner interview-interface__join-spinner" />
              <p className="interview-interface__join-title">Starting your interview…</p>
              <p className="interview-interface__join-sub">
                Waiting for Glee to connect. You’ll see the conversation as soon as they begin.
              </p>
              {gleeJoinWaitTimedOut && (
                <>
                  <p className="interview-interface__join-sub interview-interface__join-sub--warn">
                    This is taking longer than usual. You can continue if the room looks ready.
                  </p>
                  <button
                    type="button"
                    className="interview-interface__join-continue"
                    onClick={() => bypassGleeJoinGate()}
                  >
                    Continue anyway
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      <div className="interview-interface__content">
        {error && (
          <div className="interview-interface__error-banner" role="alert">
            {error}
          </div>
        )}
        <div className="interview-interface__main">
          <aside className="interview-interface__aside">
            <div className="interview-interface__panel">
              <div className="interview-interface__card">
                <div className="interview-interface__card-header">
                  <h2 className="interview-interface__card-title">Camera</h2>
                  {status && status !== 'waiting_for_response' && (
                    <div className="interview-interface__card-meta">
                      <span>{status}</span>
                    </div>
                  )}
                </div>
            <div className="interview-interface__video-wrap">
              <video ref={videoRef} autoPlay playsInline muted />
            </div>
            <MicWaveform
              inactive={!audioEnabled || isComplete || devMode}
              gleeSpeaking={isPlayingAudio}
            />
            {!isComplete && devMode && !isCommunicationSpeakingExercise && (
              <div
                className={`interview-interface__vad-status ${
                  isSubmitting && lastIsTranscribingPlaceholder
                    ? 'interview-interface__vad-status--transcribing'
                    : showGleeProcessingSidebar
                      ? 'interview-interface__vad-status--processing'
                      : 'interview-interface__vad-status--your-turn'
                }`}
              >
                {isSubmitting && lastIsTranscribingPlaceholder
                  ? 'Sending your message…'
                  : showGleeProcessingSidebar
                    ? 'Waiting for the interviewer…'
                    : 'Dev mode — type your reply below and press Send.'}
              </div>
            )}
            {!isComplete &&
              !devMode &&
              audioEnabled &&
              !isCommunicationSpeakingExercise &&
              (vad.loading ||
                isPlayingAudio ||
                isSubmitting ||
                showGleeProcessingSidebar ||
                isUserTurnToSpeak) && (
              <div
                className={`interview-interface__vad-status ${
                  vad.loading
                    ? 'interview-interface__vad-status--loading'
                    : isPlayingAudio
                      ? 'interview-interface__vad-status--muted'
                      : isSubmitting && lastIsTranscribingPlaceholder
                        ? 'interview-interface__vad-status--transcribing'
                        : showGleeProcessingSidebar
                          ? 'interview-interface__vad-status--processing'
                          : displayUserSpeaking
                            ? 'interview-interface__vad-status--speaking'
                            : 'interview-interface__vad-status--your-turn'
                }`}
              >
                {vad.loading ? (
                  <>
                    <span className="interview-interface__vad-spinner" />
                    Loading voice detection…
                  </>
                ) : isPlayingAudio ? (
                  'Glee is speaking…'
                ) : isSubmitting && lastIsTranscribingPlaceholder ? (
                  'Transcribing your response…'
                ) : showGleeProcessingSidebar ? (
                  'Glee is processing your response…'
                ) : displayUserSpeaking ? (
                  "You're speaking…"
                ) : (
                  'Your turn — speak now'
                )}
              </div>
            )}
              </div>
            </div>
          </aside>

          <div className="interview-interface__body">
            <div className="interview-interface__body-header">
              <div className="interview-interface__body-title-row">
                <h1 className="interview-interface__body-title">Interview</h1>
                <span className="interview-interface__body-type">{interviewType}</span>
              </div>
              {isCodeInterview && (
                <div className="interview-interface__tabs">
                  <button type="button" onClick={() => setActiveTab('conversation')} className={`interview-interface__tab ${activeTab === 'conversation' ? 'interview-interface__tab--active' : ''}`}>
                    Conversation
                  </button>
                  <button type="button" onClick={() => setActiveTab('code')} className={`interview-interface__tab ${activeTab === 'code' ? 'interview-interface__tab--active' : ''}`}>
                    Code
                  </button>
                </div>
              )}
              {isCaseStudy && (
                <div className="interview-interface__tabs">
                  <button type="button" onClick={() => setActiveTab('conversation')} className={`interview-interface__tab ${activeTab === 'conversation' ? 'interview-interface__tab--active' : ''}`}>
                    Conversation
                  </button>
                  <button type="button" onClick={() => setActiveTab('notes')} className={`interview-interface__tab ${activeTab === 'notes' ? 'interview-interface__tab--active' : ''}`}>
                    Notes & Question
                  </button>
                </div>
              )}
            </div>

            {showTimeWarning && !autoEnded && (
              <div className="interview-interface__warning">
                You are nearing the free session limit. This interview will end automatically at 10 minutes.
              </div>
            )}
            {autoEnded && (
              <div className="interview-interface__info">
                Free session limit reached. You can review feedback from the dashboard or upgrade your plan in the Account page.
              </div>
            )}

          {activeTab === 'conversation' && !showCommunicationPhaseUI && (
            <>
              <div className="interview-interface__transcript-area">
                <TranscriptPanel
                  messages={messages}
                  status={status}
                  fallbackMessage={aiMessage || undefined}
                  isUserTurnToSpeak={isUserTurnToSpeak}
                  userSpeaking={displayUserSpeaking}
                  className="interview-interface__transcript-panel"
                />
              </div>

              {!isComplete && (
                <p className="interview-interface__hint">
                  {devMode
                    ? 'Dev mode: replies are sent from the text box below. No microphone or AI voice — fastest for local testing.'
                    : audioEnabled
                      ? 'Mic stays on. Speak when you see “Your turn — speak now”; your response is sent automatically. Don’t speak while the interviewer is talking.'
                      : 'Turn mic on to speak.'}
                </p>
              )}
              {!isComplete && devMode && (
                <form className="interview-interface__dev-mode-form" onSubmit={handleDevModeSend}>
                  <textarea
                    className="interview-interface__dev-mode-input"
                    value={devModeDraft}
                    onChange={(e) => setDevModeDraft(e.target.value)}
                    placeholder="Type your answer…"
                    disabled={isSubmitting || awaitingStreamAi}
                    aria-label="Your text reply"
                  />
                  <button
                    type="submit"
                    className="interview-interface__dev-mode-send"
                    disabled={isSubmitting || awaitingStreamAi || !devModeDraft.trim()}
                  >
                    Send
                  </button>
                </form>
              )}
            </>
          )}

          {showCommunicationPhaseUI && (
            <div className="interview-interface__phase-stack mb-4 overflow-y-auto min-h-0">
              {(communicationPhase === 'Speaking' || communicationPhase === 'Speaking_after') &&
                (communicationData.speaking || communicationPhase) && (
                  <SpeakingPhase
                    instruction={communicationData.speaking?.instruction}
                    paragraph={communicationData.speaking?.paragraph ?? (communicationPhase ? aiMessage : undefined)}
                    onSendResponse={sendCommunicationResponse}
                    isProcessing={isSubmitting || awaitingStreamAi}
                    feedback={communicationData.speakingFeedback}
                    onClearFeedback={() =>
                      updateCommunicationData((prev) => ({ ...prev, speakingFeedback: null }))
                    }
                    devMode={devMode}
                  />
                )}
              {['Comprehension', 'Comprehension_before', 'Comprehension_after'].includes(
                communicationPhase ?? ''
              ) &&
                (communicationData.comprehension || communicationPhase) && (
                  <ComprehensionPhase
                    instruction={communicationData.comprehension?.instruction}
                    question={communicationData.comprehension?.question ?? (communicationPhase ? aiMessage : undefined)}
                    onSendResponse={sendCommunicationResponse}
                    isProcessing={isSubmitting || awaitingStreamAi}
                    feedback={communicationData.comprehensionFeedback}
                    onClearFeedback={() =>
                      updateCommunicationData((prev) => ({ ...prev, comprehensionFeedback: null }))
                    }
                  />
                )}
              {(communicationPhase === 'MCQ' || communicationPhase === 'MCQ_after') &&
                (communicationData.mcq || communicationPhase) && (
                  <MCQPhase
                    instruction={communicationData.mcq?.instruction}
                    question={communicationData.mcq?.question ?? (communicationPhase ? aiMessage : undefined)}
                    options={communicationData.mcq?.options ?? []}
                    questionNumber={communicationData.mcqCount}
                    totalQuestions={4}
                    onSendResponse={sendCommunicationResponse}
                    onMCQSubmit={() => {}}
                    feedback={communicationData.mcqFeedback}
                    onClearFeedback={() =>
                      updateCommunicationData((prev) => ({ ...prev, mcqFeedback: null }))
                    }
                  />
                )}
              {communicationPhase === 'Results' && communicationData.mcqResults && (
                <MCQResults
                  results={communicationData.mcqResults}
                  onFinishInterview={() => endSession({ sessionFinished: true, interviewTestId: interviewTypeId })}
                />
              )}
            </div>
          )}

          {activeTab === 'notes' && isCaseStudy && (
            <div className="mb-4 flex-1 min-h-[280px]">
              <CaseStudyPanel
                caseStudyQuestion={caseStudyQuestion}
                notes={notes}
                onNotesChange={setNotes}
              />
            </div>
          )}

          {activeTab === 'code' && isCodeInterview && (
            <div className="mb-4 flex-1">
              <CodeEditorPanel value={codeEditorValue} onChange={setCodeEditorValue} />
            </div>
          )}
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
