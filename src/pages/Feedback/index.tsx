import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSessionHistory } from '../../services/feedbackService';
import { ROUTES } from '../../constants/routerConstants';
import type { InterviewFeedback } from '../../types/feedback';
import { ArrowLeft } from 'lucide-react';
import ScoreBreakdown from './components/ScoreBreakdown';
import StrengthsAndImprovements from './components/StrengthsAndImprovements';
import TechnicalMetaSummary from './components/TechnicalMetaSummary';
import TechnicalExtras from './components/TechnicalExtras';

export type FeedbackLocationState = {
  type: 'video-interview' | 'resume-analysis';
  back?: string;
} & (
  | {
      type: 'video-interview';
      interview_id?: number;
      interview_type?: string;
      /** When coming from a just-ended interview (no report id yet) */
      session_id?: string;
      session_type?: string;
      title?: string;
      date?: string;
    }
  | {
      type: 'resume-analysis';
      resume_id: number;
      fileName?: string;
      date?: string;
    }
);

export default function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ interviewId?: string }>();
  const state = location.state as FeedbackLocationState | null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoFeedback, setVideoFeedback] = useState<InterviewFeedback | null>(null);

  const backPath = state?.back ?? ROUTES.DASHBOARD;

  useEffect(() => {
    const interviewIdFromParams = params.interviewId ? Number(params.interviewId) : null;
    const videoState = state?.type === 'video-interview' ? state : null;
    const hasSessionParams =
      videoState && videoState.session_id && videoState.session_type;
    const hasInterviewId =
      videoState && videoState.interview_id != null;
    const hasInterviewIdFromParams = interviewIdFromParams != null;

    if (!state?.type && !interviewIdFromParams) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    const fetchFeedback = () => {
      if (hasSessionParams && videoState) {
        // Coming from a just-finished interview: use sessionId
        return getSessionHistory({
          sessionId: videoState.session_id!,
        });
      }
      if (hasInterviewId && videoState) {
        // Opening existing feedback/report by id coming from location state
        return getSessionHistory({
          feedbackId: videoState.interview_id!,
        });
      }
      if (hasInterviewIdFromParams) {
        // Opening existing feedback/report by id coming from route params
        return getSessionHistory({
          feedbackId: interviewIdFromParams,
        });
      }
      return Promise.reject(new Error('Missing session or interview params'));
    };

    fetchFeedback()
      .then((data) => {
        setVideoFeedback(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load feedback');
        setVideoFeedback(null);
      })
      .finally(() => setLoading(false));
  }, [state, navigate, params.interviewId]);

  const effectiveState: FeedbackLocationState | null =
    state && state.type
      ? state
      : params.interviewId
        ? ({ type: 'video-interview' } as FeedbackLocationState)
        : null;

  if (!effectiveState?.type) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting…</p>
      </div>
    );
  }

  if (loading && effectiveState.type === 'video-interview') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <div className="text-gray-600">Loading feedback…</div>
      </div>
    );
  }

  // Derive a simple, robust interview type label for technical feedback
  const resolvedInterviewType =
    (state && state.type === 'video-interview' && (state.session_type ?? state.interview_type)) ||
    'Technical Interview';

  const headerTitle =
    (state && 'title' in state ? (state as FeedbackLocationState & { title?: string }).title : undefined) ||
    (effectiveState.type === 'resume-analysis' && state && 'fileName' in state
      ? (state as FeedbackLocationState & { fileName?: string }).fileName
      : undefined) ||
    (effectiveState.type === 'resume-analysis' ? 'Resume Analysis Feedback' : 'Interview Feedback');

  const headerDate =
    videoFeedback?.savedAt ||
    (state && 'date' in state ? (state as FeedbackLocationState & { date?: string }).date : undefined);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-6 rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{headerTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {headerDate && <span>{new Date(headerDate).toLocaleString()}</span>}
            {effectiveState.type === 'video-interview' && (
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                {resolvedInterviewType}
              </span>
            )}
            {effectiveState.type === 'resume-analysis' && (
              <span className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-medium text-purple-700">
                Resume Analysis
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {effectiveState.type === 'video-interview' && videoFeedback && !error && (
          <div className="space-y-5">
            {videoFeedback.overallScore != null && videoFeedback.overallScore >= 0 && (
              <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-medium text-gray-700 mb-1">Overall score</h2>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(videoFeedback.overallScore)}%
                </p>
              </div>
            )}

            <TechnicalMetaSummary data={videoFeedback} />
            <ScoreBreakdown data={videoFeedback} />
            <TechnicalExtras data={videoFeedback} />
            <StrengthsAndImprovements data={videoFeedback} />
          </div>
        )}

        {effectiveState.type === 'resume-analysis' && (
          <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-600">
              Resume analysis feedback view can be expanded here (e.g. fetch by resume_id).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
