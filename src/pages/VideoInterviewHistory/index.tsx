import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowLeft } from 'lucide-react';
import { getInterviewSessions, mapVideoReport } from '../../services/dashboardService';
import type { VideoInterviewReport } from '../../types/dashboard';
import { ROUTES } from '../../constants/routerConstants';
import VideoReportScoreChips from '../../components/shared/VideoReportScoreChips';
import { ALL_INTERVIEW_OPTIONS } from '../../data/interviewTypesData';
import './VideoInterviewHistory.css';

function lookupInterviewMeta(interviewId: number) {
  const entry = ALL_INTERVIEW_OPTIONS.find((e) => e.id === interviewId);
  if (!entry) return null;
  return {
    title: entry.title,
    category: entry.category,
    difficulty: entry.difficulty,
    topics: entry.topics,
  };
}

export default function VideoInterviewHistory() {
  const [reports, setReports] = useState<VideoInterviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const raw = await getInterviewSessions(250);
        setReports((raw?.sessions ?? []).map((item) => mapVideoReport(item, lookupInterviewMeta)));
      } catch {
        setError('Failed to load video interview history.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const ITEMS_PER_PAGE = 10;

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [reports]
  );

  const totalPages = Math.max(1, Math.ceil(sortedReports.length / ITEMS_PER_PAGE));
  const pagedReports = sortedReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleRowClick = (report: VideoInterviewReport) => {
    const path = ROUTES.FEEDBACK_HISTORY.replace(':interviewId', String(report.id));
    navigate(path, {
      state: {
        type: 'video-interview',
        interview_id: report.id,
        interview_type: report.interviewType,
        title: report.title,
        date: report.date,
        back: ROUTES.VIDEO_INTERVIEW_REPORTS,
      },
    });
  };

  const handleBack = () => {
    navigate(ROUTES.STUDENT_DASHBOARD);
  };

  if (loading) {
    return <div className="video-history__loading">Loading interview history…</div>;
  }

  return (
    <div className="video-history">
      <div className="video-history__inner">
        <button type="button" onClick={handleBack} className="video-history__back">
          <ArrowLeft aria-hidden />
          <span>Back to dashboard</span>
        </button>
        <header className="video-history__header">
          <div>
            <h1 className="video-history__title">Video interview history</h1>
            <p className="video-history__subtitle">
              Review your past practice sessions and open detailed feedback.
            </p>
          </div>
          <div className="video-history__count-wrap">
            <p className="video-history__count-label">Total interviews</p>
            <p className="video-history__count-value">{sortedReports.length}</p>
          </div>
        </header>
        {error && <div className="video-history__error" role="alert">{error}</div>}
        <div className="video-history__card">
          <div className="video-history__card-header">
            <div className="video-history__card-title-row">
              <PlayCircle aria-hidden />
              <h2 className="video-history__card-heading">All sessions</h2>
            </div>
            <p className="video-history__card-meta">Showing {pagedReports.length} of {sortedReports.length}</p>
          </div>
          <div className="video-history__table-wrap">
            <table className="video-history__table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Difficulty</th>
                  <th>Scores</th>
                </tr>
              </thead>
              <tbody>
                {pagedReports.map((report) => (
                  <tr key={report.id} onClick={() => handleRowClick(report)}>
                    <td className="video-history__cell-title">{report.title}</td>
                    <td>{report.type}</td>
                    <td>{report.date}</td>
                    <td>{report.duration} min</td>
                    <td>{report.difficulty ?? '—'}</td>
                    <td className="video-history__cell-score">
                      <VideoReportScoreChips report={report} variant="table" />
                    </td>
                  </tr>
                ))}
                {pagedReports.length === 0 && (
                  <tr>
                    <td className="video-history__empty" colSpan={6}>No video interview reports yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="video-history__pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

