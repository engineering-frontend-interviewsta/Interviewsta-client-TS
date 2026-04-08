import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSessionHistory } from '../../services/feedbackService';
import { ROUTES } from '../../constants/routerConstants';
import type { InterviewFeedback } from '../../types/feedback';
import { ArrowLeft } from 'lucide-react';
import ScoreBreakdown from './components/ScoreBreakdown';
import StrengthsAndImprovements from './components/StrengthsAndImprovements';
import TechnicalExtras from './components/TechnicalExtras';
import FeedbackHero from './components/FeedbackHero';
import FeedbackTelemetryRichReport from './components/FeedbackTelemetryRichReport';
import { hasTelemetryRichPayload } from './telemetryRichReportMappers';
import './Feedback.css';

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

function formatReportDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

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
    const hasSessionParams = videoState && videoState.session_id && videoState.session_type;
    const hasInterviewId = videoState && videoState.interview_id != null;
    const hasInterviewIdFromParams = interviewIdFromParams != null;

    if (!state?.type && !interviewIdFromParams) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    const fetchFeedback = () => {
      if (hasSessionParams && videoState) {
        return getSessionHistory({
          sessionId: videoState.session_id!,
        });
      }
      if (hasInterviewId && videoState) {
        return getSessionHistory({
          feedbackId: videoState.interview_id!,
        });
      }
      if (hasInterviewIdFromParams) {
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
    return <div className="feedback-page__redirect">Redirecting…</div>;
  }

  if (loading && effectiveState.type === 'video-interview') {
    return <div className="feedback-page__loading">Loading feedback…</div>;
  }

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

  const topbarDate = formatReportDate(headerDate);
  const topbarBadge =
    effectiveState.type === 'video-interview' ? resolvedInterviewType : 'Resume analysis';

  return (
    <div className="feedback-page">
      <div className="feedback-page__inner">
        <nav className="feedback-report__topbar" aria-label="Report">
          <Link to={backPath} className="feedback-report__topbar-back">
            <ArrowLeft aria-hidden />
            Back
          </Link>
          <div className="feedback-report__topbar-right">
            {topbarDate && (
              <span className="feedback-report__topbar-date">{topbarDate}</span>
            )}
            <span className="feedback-report__topbar-badge">{topbarBadge}</span>
          </div>
        </nav>

        {effectiveState.type === 'resume-analysis' && (
          <div className="feedback-report__simple-header">
            <h1 className="feedback-page__header-title">{headerTitle}</h1>
            <div className="feedback-page__header-meta">
              {topbarDate && <span>{topbarDate}</span>}
              <span className="feedback-page__badge feedback-page__badge--resume">
                Resume Analysis
              </span>
            </div>
          </div>
        )}

        {error && <div className="feedback-page__error" role="alert">{error}</div>}

        {effectiveState.type === 'video-interview' && videoFeedback && !error && (
          <>
            <FeedbackHero
              metaTitle={headerTitle}
              interviewKind={resolvedInterviewType}
              duration={videoFeedback.duration}
              data={videoFeedback}
            />
            {videoFeedback.isFeedbackLocked ? (
              <div className="feedback-report__locked-banner" role="status">
                <span className="feedback-report__locked-banner-icon" aria-hidden>🔒</span>
                <div className="feedback-report__locked-banner-text">
                  <strong>Detailed feedback is locked</strong>
                  <p>This was your complimentary first interview. Add credits to unlock the full breakdown — scores, strengths, improvements, and transcript.</p>
                </div>
              </div>
            ) : (
              <div className="feedback-report__body">
                <ScoreBreakdown data={videoFeedback} />
                <StrengthsAndImprovements data={videoFeedback} />
                <TechnicalExtras data={videoFeedback} />
                {videoFeedback.telemetryData != null &&
                hasTelemetryRichPayload(videoFeedback.telemetryData) ? (
                  <FeedbackTelemetryRichReport telemetry={videoFeedback.telemetryData} />
                ) : null}
              </div>
            )}
          </>
        )}

        {effectiveState.type === 'resume-analysis' && (
          <div className="feedback-report__body">
            <div className="feedback-page__section">
              <p className="feedback-page__pending" style={{ margin: 0 }}>
                Resume analysis feedback view can be expanded here (e.g. fetch by resume_id).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
