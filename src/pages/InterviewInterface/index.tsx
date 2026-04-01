import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearInterviewAccessToken } from '../../api/axiosInstance';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { usePlanStatus } from '../../hooks/usePlanStatus';
import { getInterviewFeedbackStatus } from '../../services/interviewService';
import { float32ToWavBlob } from '../../utils/blobToWav';
import { useMicVAD } from '@ricky0123/vad-react';
import CodeEditorPanel from './components/CodeEditorPanel';
import CaseStudyPanel from './components/CaseStudyPanel';
import { SpeakingPhase, ComprehensionPhase, MCQPhase, MCQResults } from './components/Communication';
import InterviewHeader from './components/InterviewHeader';
import EndInterviewModal from './components/EndInterviewModal';
import TranscriptPanel from './components/TranscriptPanel';
import { ROUTES } from '../../constants/routerConstants';
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
    interviewTypeId?: number;
  } | null;
  const sessionId = state?.sessionId;
  const interviewType = state?.interviewType ?? 'Technical';
  const interviewTypeId = state?.interviewTypeId;

  // Dev mode should always start OFF for every new interview session.
  const [devMode, setDevMode] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => { 
    
    return () => clearInterviewAccessToken()}, []);
  
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [endTaskId, setEndTaskId] = useState<string | null>(null);
  const appendStreamUserTranscriptRef = useRef(true);

  const {
    aiMessage,
    messages,
    lastNode,
    communicationData,
    status,
    isComplete,
    isSubmitting,
    isPlayingAudio,
    submitText,
    submitAudio,
    submitCode,
    endSession,
    addUserMessage,
    updateCommunicationData,
  } = useInterviewSession({
    sessionId: sessionId ?? '',
    interviewType,
    devMode,
    appendStreamUserTranscriptRef,
  });

  const [textInput, setTextInput] = useState('');
  const { videoRef, videoEnabled, audioEnabled, micLevel, toggleVideo, toggleAudio, getStream, streamReady } =
    useMediaDevices();
  const allowVadSendRef = useRef(true);
  const [activeTab, setActiveTab] = useState<'conversation' | 'code' | 'notes'>('conversation');
  const [notes, setNotes] = useState('');
  const [caseStudyQuestion, setCaseStudyQuestion] = useState<string | null>(null);
  const { planStatus } = usePlanStatus();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [autoEnded, setAutoEnded] = useState(false);
  const hasNavigatedToFeedbackRef = useRef(false);
  /** True when user clicked End and we're waiting for feedback task — don't navigate until poll completes */
  const waitingForFeedbackRef = useRef(false);

  const isCodeInterview =
    interviewType === 'technical' ||
    interviewType === 'coding' ||
    interviewType === 'role-based' ||
    interviewType === 'company' ||
    interviewType === 'subject';

  const isCaseStudy = interviewType === 'case-study';
  const isCommunication = interviewType === 'miscellaneous'; // TODO: This is a temporary solution due to the backend setup and avoiding tampering a lot of apis, will fix this later as this is an issue avoiding us to add any further miscellaneous interview types.

  // Capture case study question when AI sends it (lastNode === 'CaseStudy')
  useEffect(() => {
    if (isCaseStudy && lastNode === 'CaseStudy' && aiMessage && !caseStudyQuestion) {
      setCaseStudyQuestion(aiMessage);
    }
  }, [isCaseStudy, lastNode, aiMessage, caseStudyQuestion]);

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
  allowVadSendRef.current = !isCommunicationSpeakingExercise;

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
      if (!allowVadSendRef.current || devMode) return;
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

  // Seamless conversation: mic stays on; we only pause *listening* when Glee is speaking so the user
  // never has to click the mic. When AI audio ends, VAD starts again and we capture/send automatically.
  // Important: only call vad.start() after VAD has finished loading and we have an active mic stream.
  useEffect(() => {
    if (isComplete) {
      vad.pause();
      return;
    }
    if (vad.loading) return; // Wait for model load before starting (matches old frontend)
    if (audioEnabled && !isPlayingAudio && !isSubmitting) {
      getStream()
        .then((stream) => {
          if (stream?.active) void vad.start();
        })
        .catch(() => {});
    } else {
      vad.pause();
    }
  }, [audioEnabled, isPlayingAudio, isSubmitting, isComplete, vad.loading, getStream]);

  useEffect(() => {
    // In dev mode, force mic muted so voice input does not run.
    if (devMode && audioEnabled) {
      toggleAudio();
    }
  }, [devMode, audioEnabled, toggleAudio]);

  // When it's clearly the user's turn: session active, mic on, VAD ready, AI not speaking, not submitting
  const isUserTurnToSpeak =
    !isComplete &&
    !vad.loading &&
    audioEnabled &&
    !isPlayingAudio &&
    !isSubmitting &&
    !isCommunicationSpeakingExercise;

  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.VIDEO_INTERVIEW, { replace: true });
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!planStatus?.has_time_limit || isComplete) return;
    const key = 'interview_start_ts';
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, String(Date.now()));
    }
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const storedStart = sessionStorage.getItem(key);
      const startTs = storedStart ? Number(storedStart) : Date.now();
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed >= 300 && !showTimeWarning) {
        setShowTimeWarning(true);
      }
      if (elapsed >= 600 && !autoEnded) {
        setAutoEnded(true);
        setShowTimeWarning(false);
        sessionStorage.removeItem(key);
        void endSession({ sessionFinished: true, interviewTestId: interviewTypeId });
      } else {
        setTimeout(tick, 1000);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [planStatus?.has_time_limit, isComplete, endSession, showTimeWarning, autoEnded, interviewTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;
    addUserMessage(text);
    setTextInput('');
    await submitText(text);
  };

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

  const toggleDevMode = useCallback(() => {
    setDevMode((prev) => !prev);
  }, []);

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

  return (
    <div className="interview-interface">
      <InterviewHeader
          elapsedSeconds={elapsedSeconds}
          devMode={devMode}
          onToggleDevMode={toggleDevMode}
          onExportTranscript={messages.length > 0 ? exportTranscript : undefined}
          onEndClick={handleEndClick}
          isEnding={isEndingInterview}
          isComplete={isComplete}
        />
      <EndInterviewModal
        open={showEndModal}
        onClose={() => !endTaskId && setShowEndModal(false)}
        onConfirm={handleEndConfirm}
        isEnding={isEndingInterview}
        isPreparingFeedback={!!endTaskId}
      />
      <div className="interview-interface__content">
        <div className="interview-interface__main">
          <aside className="interview-interface__aside">
            <div className="interview-interface__panel">
              <div className="interview-interface__card">
                <div className="interview-interface__card-header">
                  <h2 className="interview-interface__card-title">Camera</h2>
              <div className="interview-interface__card-meta">
                {status && status !== 'waiting_for_response' && <span>{status}</span>}
                {planStatus?.has_time_limit && (
                  <span>
                    {Math.floor(elapsedSeconds / 60)}:
                    {(elapsedSeconds % 60).toString().padStart(2, '0')} / 10:00
                  </span>
                )}
              </div>
            </div>
            <div className="interview-interface__video-wrap">
              <video ref={videoRef} autoPlay playsInline muted />
            </div>
            <div className="interview-interface__controls">
              <div className="interview-interface__control-btns">
                <button type="button" onClick={toggleVideo} className="interview-interface__btn-control">
                  {videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                </button>
                <button type="button" onClick={toggleAudio} className="interview-interface__btn-control">
                  {audioEnabled ? 'Mute mic' : 'Unmute mic'}
                </button>
              </div>
              <div className="interview-interface__mic-level">
                <span className="interview-interface__mic-level-label">Mic level</span>
                <div className="interview-interface__mic-level-bar">
                  <div className="interview-interface__mic-level-fill" style={{ width: `${Math.round(micLevel * 100)}%` }} />
                </div>
              </div>
            </div>
            {!isComplete && audioEnabled && (vad.loading || isUserTurnToSpeak || isPlayingAudio || isSubmitting) && (
              <div className={`interview-interface__vad-status ${
                vad.loading ? 'interview-interface__vad-status--loading' :
                isUserTurnToSpeak ? (vad.userSpeaking ? 'interview-interface__vad-status--speaking' : 'interview-interface__vad-status--your-turn') :
                'interview-interface__vad-status--muted'
              }`}>
                {vad.loading ? (
                  <>
                    <span className="interview-interface__vad-spinner" />
                    Loading voice detection…
                  </>
                ) : isUserTurnToSpeak ? (
                  vad.userSpeaking ? "You're speaking…" : 'Your turn — speak now'
                ) : isPlayingAudio ? 'Interviewer is speaking…' : 'Sending…'}
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
                  userSpeaking={vad.userSpeaking}
                  allowDevTextInput={devMode}
                  className="interview-interface__transcript-panel"
                />
              </div>

              {!isComplete && devMode && (
                <form onSubmit={handleSubmit} className="interview-interface__form">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your response…"
                    className="interview-interface__input"
                    disabled={isSubmitting}
                  />
                  <button type="submit" disabled={isSubmitting || !textInput.trim()} className="interview-interface__btn-send">
                    {isSubmitting ? 'Sending…' : 'Send'}
                  </button>
                </form>
              )}

              {!isComplete && (
                <p className="interview-interface__hint">
                  {devMode
                    ? audioEnabled
                      ? 'Dev mode: use Send or mic. In production, only voice is used.'
                      : 'Dev mode: turn mic on to speak, or type and Send.'
                    : audioEnabled
                      ? 'Mic stays on. Speak when you see “Your turn — speak now”; your response is sent automatically. Don’t speak while the interviewer is talking.'
                      : 'Turn mic on to speak.'}
                </p>
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
                    isProcessing={isSubmitting}
                    feedback={communicationData.speakingFeedback}
                    onClearFeedback={() =>
                      updateCommunicationData((prev) => ({ ...prev, speakingFeedback: null }))
                    }
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
                    isProcessing={isSubmitting}
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
              <CodeEditorPanel onSend={submitCode} disabled={isSubmitting} />
            </div>
          )}

          <div className="interview-interface__actions">
            {isComplete && (
              <Link to={ROUTES.STUDENT_DASHBOARD} className="interview-interface__btn-primary">
                Back to Dashboard
              </Link>
            )}
            <Link to={ROUTES.VIDEO_INTERVIEW} className="interview-interface__btn-secondary">
              Back to Video Interview
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
