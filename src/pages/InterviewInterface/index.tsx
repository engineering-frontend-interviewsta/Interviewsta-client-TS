import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { useSpeechCapture } from '../../hooks/useSpeechCapture';
import { usePlanStatus } from '../../hooks/usePlanStatus';
import CodeEditorPanel from './components/CodeEditorPanel';
import CaseStudyPanel from './components/CaseStudyPanel';
import { SpeakingPhase, ComprehensionPhase, MCQPhase, MCQResults } from './components/Communication';
import { ROUTES } from '../../constants/routerConstants';

export default function InterviewInterface() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { sessionId?: string; interviewType?: string } | null;
  const sessionId = state?.sessionId;
  const interviewType = state?.interviewType ?? 'Technical';

  const {
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
    updateCommunicationData,
  } = useInterviewSession({
    sessionId: sessionId ?? '',
    interviewType,
  });

  const [textInput, setTextInput] = useState('');
  const { videoRef, videoEnabled, audioEnabled, micLevel, error: mediaError, toggleVideo, toggleAudio } =
    useMediaDevices();
  const { isRecording, startRecording, stopRecording } = useSpeechCapture(submitAudio);
  const [activeTab, setActiveTab] = useState<'conversation' | 'code' | 'notes'>('conversation');
  const [notes, setNotes] = useState('');
  const [caseStudyQuestion, setCaseStudyQuestion] = useState<string | null>(null);
  const { planStatus } = usePlanStatus();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [autoEnded, setAutoEnded] = useState(false);

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
        void endSession({ sessionFinished: true });
      } else {
        setTimeout(tick, 1000);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [planStatus?.has_time_limit, isComplete, endSession, showTimeWarning, autoEnded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    await submitText(textInput);
    setTextInput('');
  };

  const handleEnd = async () => {
    await endSession({ sessionFinished: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 lg:flex-row">
        {/* Left: camera + status */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Camera</h2>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs text-gray-500">{status}</span>
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
              <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[240px] mb-4 overflow-y-auto">
                {aiMessage ? (
                  <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                    {aiMessage}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {status === 'connecting' ? 'Connecting…' : 'Waiting for the first question…'}
                  </p>
                )}
              </div>

              {!isComplete && (
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your response…"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !textInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending…' : 'Send'}
                  </button>
                </form>
              )}

              {!isComplete && (
                <div className="mb-4 flex items-center gap-3 text-xs text-gray-600">
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                      isRecording
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {isRecording ? 'Release to send voice' : 'Hold to speak'}
                  </button>
                  <span className="text-[11px] text-gray-500">
                    Your voice will be transcribed and sent as a response.
                  </span>
                </div>
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
                  onFinishInterview={() => endSession({ sessionFinished: true })}
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
            {!isComplete && (
              <button
                type="button"
                onClick={handleEnd}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50"
              >
                End interview
              </button>
            )}
            {isComplete && (
              <Link
                to={ROUTES.DASHBOARD}
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
  );
}
