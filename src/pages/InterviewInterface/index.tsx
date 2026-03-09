import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { ROUTES } from '../../constants/routerConstants';

export default function InterviewInterface() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { sessionId?: string; interviewType?: string } | null;
  const sessionId = state?.sessionId;
  const interviewType = state?.interviewType ?? 'Technical';

  const {
    aiMessage,
    status,
    isComplete,
    error,
    isSubmitting,
    submitText,
    endSession,
  } = useInterviewSession({
    sessionId: sessionId ?? '',
    interviewType,
  });

  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.VIDEO_INTERVIEW, { replace: true });
    }
  }, [sessionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    await submitText(textInput);
    setTextInput('');
  };

  const handleEnd = async () => {
    await endSession({ sessionFinished: true });
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Interview</h1>
          <span className="text-sm text-gray-500">{status}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[200px] mb-6">
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
  );
}
