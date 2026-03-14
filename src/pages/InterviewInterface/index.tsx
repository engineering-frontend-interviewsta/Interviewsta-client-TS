import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

const FEEDBACK_POLL_INTERVAL_MS = 2000;
const FEEDBACK_POLL_MAX_ATTEMPTS = 45;

const DEV_MODE_KEY = 'devMode';

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

  const [devMode, setDevMode] = useState(() => typeof localStorage !== 'undefined' && localStorage.getItem(DEV_MODE_KEY) === 'true');
  const [showEndModal, setShowEndModal] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [endTaskId, setEndTaskId] = useState<string | null>(null);

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
  });

  const [textInput, setTextInput] = useState('');
  const { videoRef, videoEnabled, audioEnabled, micLevel, error: mediaError, toggleVideo, toggleAudio, getStream } =
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
    interviewType === 'Technical' ||
    interviewType === 'Coding' ||
    interviewType === 'Role-Based Interview' ||
    interviewType === 'Company' ||
    interviewType === 'Subject';

  const isCaseStudy = interviewType === 'Case Study Interview';
  const isCommunication = interviewType === 'Communication Interview';

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

  const vad = useMicVAD({
    startOnLoad: false,
    getStream,
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
  // Important: only call vad.start() after VAD has finished loading (like old frontend), else start() no-ops.
  useEffect(() => {
    if (isComplete) {
      vad.pause();
      return;
    }
    if (vad.loading) return; // Wait for model load before starting (matches old frontend)
    if (audioEnabled && !isPlayingAudio && !isSubmitting) {
      void vad.start();
    } else {
      vad.pause();
    }
  }, [audioEnabled, isPlayingAudio, isSubmitting, isComplete, vad.loading]);

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
    const next = !devMode;
    setDevMode(next);
    try {
      localStorage.setItem(DEV_MODE_KEY, String(next));
    } catch {
      // ignore
    }
  }, [devMode]);

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
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
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
      <div className="flex-1 min-h-0 overflow-auto px-2 sm:px-4 md:px-6 pb-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 lg:flex-row py-4">
        {/* Left: camera + status */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Camera</h2>
              <div className="flex flex-col items-end gap-0.5">
                {status && status !== 'waiting_for_response' && (
                  <span className="text-xs text-gray-500">{status}</span>
                )}
                {planStatus?.has_time_limit && (
                  <span className="text-[11px] text-gray-400">
                    {Math.floor(elapsedSeconds / 60)}:
                    {(elapsedSeconds % 60).toString().padStart(2, '0')} / 10:00
                  </span>
                )}
              </div>
            </div>
            <div className="aspect-video w-full rounded-lg bg-black overflow-hidden mb-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            </div>
            {mediaError && (
              <p className="text-xs text-red-600 mb-2">{mediaError}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVideo}
                  className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                >
                  {videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                </button>
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                >
                  {audioEnabled ? 'Mute mic' : 'Unmute mic'}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-gray-500">Mic level</span>
                <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${Math.round(micLevel * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            {!isComplete && audioEnabled && (vad.loading || isUserTurnToSpeak || isPlayingAudio || isSubmitting) && (
              <div className="mt-2 px-1 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                {vad.loading ? (
                  <span className="text-xs text-amber-600 flex items-center justify-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    Loading voice detection…
                  </span>
                ) : isUserTurnToSpeak ? (
                  vad.userSpeaking ? (
                    <span className="text-xs font-medium text-blue-600">You&apos;re speaking…</span>
                  ) : (
                    <span className="text-xs font-medium text-green-600">Your turn — speak now</span>
                  )
                ) : isPlayingAudio ? (
                  <span className="text-xs text-slate-500">Interviewer is speaking…</span>
                ) : (
                  <span className="text-xs text-slate-500">Sending…</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: conversation / code */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Interview</h1>
              <span className="text-xs text-gray-500">{interviewType}</span>
            </div>
            {isCodeInterview && (
              <div className="flex gap-1 text-xs bg-gray-100 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('conversation')}
                  className={`px-3 py-1 rounded-full ${
                    activeTab === 'conversation' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Conversation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-full ${
                    activeTab === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Code
                </button>
              </div>
            )}
            {isCaseStudy && (
              <div className="flex gap-1 text-xs bg-gray-100 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('conversation')}
                  className={`px-3 py-1 rounded-full ${
                    activeTab === 'conversation' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Conversation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-1 rounded-full ${
                    activeTab === 'notes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Notes & Question
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {vad.errored && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              Voice detection error: {typeof vad.errored === 'string' ? vad.errored : 'Could not start microphone.'}
            </div>
          )}

          {showTimeWarning && !autoEnded && (
            <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              You are nearing the free session limit. This interview will end automatically at 10 minutes.
            </div>
          )}

          {autoEnded && (
            <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
              Free session limit reached. You can review feedback from the dashboard or upgrade your plan in
              the Account page.
            </div>
          )}

          {activeTab === 'conversation' && !showCommunicationPhaseUI && (
            <>
              <div className="flex-1 min-h-0 flex flex-col mb-4">
                <TranscriptPanel
                  messages={messages}
                  status={status}
                  fallbackMessage={aiMessage || undefined}
                  isUserTurnToSpeak={isUserTurnToSpeak}
                  userSpeaking={vad.userSpeaking}
                  className="flex-1 min-h-[240px]"
                />
              </div>

              {!isComplete && (
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your response…"
                    className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !textInput.trim()}
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending…' : 'Send'}
                  </button>
                </form>
              )}

              {!isComplete && (
                <p className="mb-4 text-xs text-neutral-500">
                  {audioEnabled
                    ? 'Mic stays on. Speak when you see “Your turn — speak now”; your response is sent automatically. Don’t speak while the interviewer is talking.'
                    : 'Turn mic on to speak.'}
                </p>
              )}
            </>
          )}

          {showCommunicationPhaseUI && (
            <div className="mb-4 overflow-y-auto">
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

          <div className="flex flex-wrap gap-3">
            {isComplete && (
              <Link
                to={ROUTES.STUDENT_DASHBOARD}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
            )}
            <Link
              to={ROUTES.VIDEO_INTERVIEW}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
            >
              Back to Video Interview
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
