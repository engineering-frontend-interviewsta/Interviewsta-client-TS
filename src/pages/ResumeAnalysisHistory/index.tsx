import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { getResumeSessions, mapResumeReport } from '../../services/dashboardService';
import type { ResumeReport } from '../../types/dashboard';
import { ROUTES } from '../../constants/routerConstants';
import './ResumeAnalysisHistory.css';

export default function ResumeAnalysisHistory() {
  const [reports, setReports] = useState<ResumeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const raw = await getResumeSessions();
        setReports(raw.sessions.map(mapResumeReport));
      } catch {
        setError('Failed to load resume analysis history.');
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

  const handleRowClick = (report: ResumeReport) => {
    navigate(ROUTES.FEEDBACK, {
      state: {
        type: 'resume-analysis',
        resume_id: report.id,
        fileName: report.fileName,
        date: report.date,
        back: ROUTES.RESUME_ANALYSIS_REPORTS,
      },
    });
  };

  const handleBack = () => {
    navigate(ROUTES.STUDENT_DASHBOARD);
  };

  const getScoreClass = (score: number | undefined) => {
    if (score == null) return 'resume-history__cell-score--default';
    if (score >= 80) return 'resume-history__cell-score--high';
    if (score >= 60) return 'resume-history__cell-score--mid';
    return 'resume-history__cell-score--low';
  };

  if (loading) {
    return <div className="resume-history__loading">Loading resume analysis history…</div>;
  }

  return (
    <div className="resume-history">
      <div className="resume-history__inner">
        <button type="button" onClick={handleBack} className="resume-history__back">
          <ArrowLeft aria-hidden />
          <span>Back to dashboard</span>
        </button>
        <header className="resume-history__header">
          <div>
            <h1 className="resume-history__title">Resume analysis history</h1>
            <p className="resume-history__subtitle">
              Review all your past resume analyses and open detailed feedback.
            </p>
          </div>
          <div className="resume-history__count-wrap">
            <p className="resume-history__count-label">Total analyses</p>
            <p className="resume-history__count-value">{sortedReports.length}</p>
          </div>
        </header>
        {error && <div className="resume-history__error" role="alert">{error}</div>}
        <div className="resume-history__card">
          <div className="resume-history__card-header">
            <div className="resume-history__card-title-row">
              <FileText aria-hidden />
              <h2 className="resume-history__card-heading">All analyses</h2>
            </div>
            <p className="resume-history__card-meta">Showing {pagedReports.length} of {sortedReports.length}</p>
          </div>
          <div className="resume-history__table-wrap">
            <table className="resume-history__table">
              <thead>
                <tr>
                  <th>File name</th>
                  <th>Date</th>
                  <th>Target role</th>
                  <th>Company</th>
                  <th>Overall score</th>
                  <th>Job match</th>
                </tr>
              </thead>
              <tbody>
                {pagedReports.map((report) => (
                  <tr key={report.id} onClick={() => handleRowClick(report)}>
                    <td className="resume-history__cell-title">{report.fileName}</td>
                    <td>{report.date}</td>
                    <td>{report.targetRole ?? '—'}</td>
                    <td>{report.company ?? '—'}</td>
                    <td className={`resume-history__cell-score ${getScoreClass(report.overallScore)}`}>
                      {report.overallScore != null ? `${report.overallScore}%` : '—'}
                    </td>
                    <td className={`resume-history__cell-score ${getScoreClass(report.jobMatchScore)}`}>
                      {report.jobMatchScore != null ? `${report.jobMatchScore}%` : '—'}
                    </td>
                  </tr>
                ))}
                {pagedReports.length === 0 && (
                  <tr>
                    <td className="resume-history__empty" colSpan={6}>No resume analysis reports yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="resume-history__pagination">
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

