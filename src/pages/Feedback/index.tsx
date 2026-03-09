import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getSessionHistory } from '../../services/feedbackService';
import { ROUTES } from '../../constants/routerConstants';
import type { SessionHistoryResponse } from '../../types/feedback';
import { ArrowLeft } from 'lucide-react';
import ScoreBreakdown from './components/ScoreBreakdown';
import StrengthsAndImprovements from './components/StrengthsAndImprovements';

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
  const state = location.state as FeedbackLocationState | null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoFeedback, setVideoFeedback] = useState<SessionHistoryResponse | null>(null);

  const backPath = state?.back ?? ROUTES.DASHBOARD;

  useEffect(() => {
    if (!state?.type) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }
    if (state.type === 'video-interview' && 'interview_id' in state) {
      const interviewType = state.interview_type ?? 'Technical Interview';
      getSessionHistory({
        interview_id: state.interview_id,
        interview_type: interviewType,
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
  }, [state, navigate]);

  if (!state?.type) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting…</p>
      </div>
    );
  }

  if (loading && state.type === 'video-interview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4 flex items-center justify-center">
        <div className="text-gray-600">Loading feedback…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {state.type === 'video-interview' && 'title' in state && (
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {state.title ?? 'Interview Feedback'}
          </h1>
        )}
        {state.type === 'video-interview' && 'date' in state && state.date && (
          <p className="text-gray-500 text-sm mb-6">{state.date}</p>
        )}
        {state.type === 'resume-analysis' && 'fileName' in state && (
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {state.fileName ?? 'Resume Analysis Feedback'}
          </h1>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-6">
            {error}
          </div>
        )}

        {state.type === 'video-interview' && videoFeedback && !error && (
          <div className="space-y-6">
            {videoFeedback.status === 'pending' && (
              <p className="text-gray-600">Feedback is still being generated. Check back shortly.</p>
            )}
            {videoFeedback.overall_score != null && (
              <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall score</h2>
                <p className="text-3xl font-bold text-blue-600">{videoFeedback.overall_score}%</p>
              </div>
            )}
            <ScoreBreakdown data={videoFeedback} />
            <StrengthsAndImprovements data={videoFeedback} />
          </div>
        )}

        {state.type === 'resume-analysis' && (
          <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <p className="text-gray-600">
              Resume analysis feedback view can be expanded here (e.g. fetch by resume_id).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
