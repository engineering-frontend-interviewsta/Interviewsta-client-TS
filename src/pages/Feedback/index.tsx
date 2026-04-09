import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSessionHistory } from '../../services/feedbackService';
import { getResumeAnalysisById } from '../../services/resumeService';
import { ROUTES } from '../../constants/routerConstants';
import type { InterviewFeedback } from '../../types/feedback';
import type { ResumeAnalysisResult } from '../../services/resumeService';
import { ArrowLeft } from 'lucide-react';
import ScoreBreakdown from './components/ScoreBreakdown';
import StrengthsAndImprovements from './components/StrengthsAndImprovements';
import TechnicalExtras from './components/TechnicalExtras';
import FeedbackHero from './components/FeedbackHero';
import FeedbackTelemetryRichReport from './components/FeedbackTelemetryRichReport';
import LockedFeedbackPreview from './components/LockedFeedbackPreview';
import ResumeAnalysisReport from './components/ResumeAnalysisReport';
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
      resume_id?: number | string;
      fileName?: string;
      date?: string;
      /** Full result when navigating from analyze flow (optional if URL has :analysisId) */
      analysisResult?: ResumeAnalysisResult;
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
  const params = useParams<{ interviewId?: string; analysisId?: string }>();
  const state = location.state as FeedbackLocationState | null;
  const analysisIdFromRoute = params.analysisId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoFeedback, setVideoFeedback] = useState<InterviewFeedback | null>(null);
  const [fetchedResume, setFetchedResume] = useState<ResumeAnalysisResult | null>(null);
  const [resumeFetchError, setResumeFetchError] = useState<string | null>(null);

  const effectiveState: FeedbackLocationState | null = useMemo(() => {
    if (analysisIdFromRoute) {
      return { type: 'resume-analysis', back: state?.back } as FeedbackLocationState;
    }
    if (state && state.type) return state;
    if (params.interviewId) return { type: 'video-interview' } as FeedbackLocationState;
    return null;
  }, [analysisIdFromRoute, state, params.interviewId]);

  const backPath =
    state?.back ??
    (analysisIdFromRoute ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD);

  useEffect(() => {
    const interviewIdFromParams = params.interviewId ? Number(params.interviewId) : null;
    const videoState = state?.type === 'video-interview' ? state : null;
    const hasSessionParams = videoState && videoState.session_id && videoState.session_type;
    const hasInterviewId = videoState && videoState.interview_id != null;
    const hasInterviewIdFromParams = interviewIdFromParams != null;

    if (!state?.type && !interviewIdFromParams && !analysisIdFromRoute) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    if (analysisIdFromRoute) {
      setLoading(true);
      setResumeFetchError(null);
      getResumeAnalysisById(analysisIdFromRoute)
        .then((data) => {
          setFetchedResume(data);
          setResumeFetchError(null);
        })
        .catch((err) => {
          setFetchedResume(null);
          setResumeFetchError(err instanceof Error ? err.message : 'Failed to load resume report');
        })
        .finally(() => setLoading(false));
      return;
    }

    if (state?.type === 'resume-analysis') {
      setFetchedResume(null);
      setResumeFetchError(null);
      setLoading(false);
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
  }, [state, navigate, params.interviewId, analysisIdFromRoute]);

  if (!effectiveState?.type) {
    return <div className="feedback-page__redirect">Redirecting…</div>;
  }

  if (loading && (effectiveState.type === 'video-interview' || Boolean(analysisIdFromRoute))) {
    return <div className="feedback-page__loading">Loading feedback…</div>;
  }

  const resolvedInterviewType =
    (state && state.type === 'video-interview' && (state.session_type ?? state.interview_type)) ||
    'Technical Interview';

  const resumeState = state?.type === 'resume-analysis' ? state : null;
  const resumeAnalysisResult = fetchedResume ?? resumeState?.analysisResult ?? null;

  const headerTitle =
    (state && 'title' in state ? (state as FeedbackLocationState & { title?: string }).title : undefined) ||
    (effectiveState.type === 'resume-analysis' && resumeState?.fileName) ||
    (effectiveState.type === 'resume-analysis' && resumeAnalysisResult?.resumeName) ||
    (effectiveState.type === 'resume-analysis' ? 'Resume Analysis Feedback' : 'Interview Feedback');

  const headerDate =
    videoFeedback?.savedAt ||
    (state && 'date' in state ? (state as FeedbackLocationState & { date?: string }).date : undefined);

  const topbarDate = formatReportDate(headerDate);
  const topbarBadge =
    effectiveState.type === 'video-interview' ? resolvedInterviewType : 'Resume analysis';

  const resumeFileLabel =
    resumeState?.fileName ?? resumeAnalysisResult?.resumeName ?? undefined;

  return (
    <div className="feedback-page">
      <div className="feedback-page__inner">
        <nav className="feedback-report__topbar" aria-label="Report">
          <Link to={backPath} className="feedback-report__topbar-back">
            <ArrowLeft aria-hidden />
            Back
          </Link>
          <div className="feedback-report__topbar-meta">
            {topbarDate && (
              <span className="feedback-report__topbar-date">{topbarDate}</span>
            )}
            <span className="feedback-report__topbar-badge">{topbarBadge}</span>
          </div>
        </nav>

        {effectiveState.type === 'resume-analysis' && !resumeAnalysisResult && !resumeFetchError && (
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

        {effectiveState.type === 'video-interview' && error && (
          <div className="feedback-page__error" role="alert">{error}</div>
        )}

        {analysisIdFromRoute && resumeFetchError && (
          <div className="feedback-page__error" role="alert">{resumeFetchError}</div>
        )}

        {effectiveState.type === 'video-interview' && videoFeedback && !error && (
          <>
            <FeedbackHero
              metaTitle={headerTitle}
              interviewKind={resolvedInterviewType}
              duration={videoFeedback.duration}
              data={videoFeedback}
            />
            {videoFeedback.isFeedbackLocked ? (
              <LockedFeedbackPreview />
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

        {effectiveState.type === 'resume-analysis' && resumeAnalysisResult && !resumeFetchError && (
          <ResumeAnalysisReport
            result={resumeAnalysisResult}
            fileName={resumeFileLabel}
          />
        )}

        {effectiveState.type === 'resume-analysis' && !resumeAnalysisResult && resumeFetchError === null && !analysisIdFromRoute && (
          <div className="feedback-report__body">
            <div className="feedback-page__section">
              <p className="feedback-page__pending" style={{ margin: 0 }}>
                Resume analysis details are not available for this report.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
