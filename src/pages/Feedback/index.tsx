import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSessionHistory } from '../../services/feedbackService';
import { ROUTES } from '../../constants/routerConstants';
import type { SessionHistoryResponse } from '../../types/feedback';
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
      interview_id: number;
      interview_type?: string;
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
  const [videoFeedback, setVideoFeedback] = useState<SessionHistoryResponse | null>(null);

  const backPath = state?.back ?? ROUTES.DASHBOARD;

  useEffect(() => {
    const interviewIdFromParams = params.interviewId ? Number(params.interviewId) : null;

    if (!state?.type && !interviewIdFromParams) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    const hasStateVideoId = state && state.type === 'video-interview' && 'interview_id' in state;

    if (hasStateVideoId || interviewIdFromParams) {
      const interviewId = hasStateVideoId ? (state as FeedbackLocationState & { interview_id: number }).interview_id : interviewIdFromParams!;
      const interviewType =
        hasStateVideoId && (state as FeedbackLocationState & { interview_type?: string }).interview_type
          ? (state as FeedbackLocationState & { interview_type?: string }).interview_type
          : 'Technical Interview';

      getSessionHistory({
        interview_id: interviewId,
        interview_type: interviewType as string,
      })
        .then((data) => {
          setVideoFeedback(data);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load feedback');
          setVideoFeedback(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
    (videoFeedback?.interview_test_details?.interview_mode as string | undefined) ||
    (state && 'interview_type' in state ? (state as FeedbackLocationState & { interview_type?: string }).interview_type : undefined) ||
    'Technical Interview';

  const headerTitle =
    (videoFeedback?.interview_test_details?.interview_title as string | undefined) ||
    (state && 'title' in state ? (state as FeedbackLocationState & { title?: string }).title : undefined) ||
    (effectiveState.type === 'resume-analysis' && state && 'fileName' in state
      ? (state as FeedbackLocationState & { fileName?: string }).fileName
      : undefined) ||
    (effectiveState.type === 'resume-analysis' ? 'Resume Analysis Feedback' : 'Interview Feedback');

  const headerDate =
    (videoFeedback?.interview_test_details?.created_at as string | undefined) ||
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
            {videoFeedback.status === 'pending' && (
              <p className="text-sm text-gray-600">
                Feedback is still being generated. Check back shortly.
              </p>
            )}

            {videoFeedback.overall_score != null && (
              <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <h2 className="text-sm font-medium text-gray-700 mb-1">Overall score</h2>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(videoFeedback.overall_score)}%
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
