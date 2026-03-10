import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { getResumeProgress, mapResumeReport } from '../../services/dashboardService';
import type { ResumeReport } from '../../types/dashboard';
import { ROUTES } from '../../constants/routerConstants';

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
        const raw = await getResumeProgress();
        setReports(raw.map(mapResumeReport));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-600">Loading resume analysis history…</div>
      </div>
    );
  }

  const getScoreClass = (score: number | undefined) => {
    if (score == null) return 'text-gray-700';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to dashboard</span>
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resume analysis history</h1>
            <p className="text-gray-600 text-sm mt-1">
              Review all your past resume analyses and open detailed feedback.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total analyses</p>
            <p className="text-2xl font-bold text-gray-900">{sortedReports.length}</p>
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <h2 className="text-sm font-semibold text-gray-900">All analyses</h2>
            </div>
            <p className="text-xs text-gray-600">
              Showing {pagedReports.length} of {sortedReports.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 sm:px-6 text-left font-semibold">File name</th>
                  <th className="py-3 px-4 sm:px-6 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-left font-semibold">Target role</th>
                  <th className="py-3 px-4 sm:px-6 text-left font-semibold">Company</th>
                  <th className="py-3 px-4 sm:px-6 text-left font-semibold">Overall score</th>
                  <th className="py-3 px-4 sm:px-6 text-left font-semibold">Job match</th>
                </tr>
              </thead>
              <tbody>
                {pagedReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-100 hover:bg-purple-50/40 cursor-pointer"
                    onClick={() => handleRowClick(report)}
                  >
                    <td className="py-3 px-4 sm:px-6 font-medium text-gray-900">{report.fileName}</td>
                    <td className="py-3 px-4 sm:px-6 text-gray-700">{report.date}</td>
                    <td className="py-3 px-4 sm:px-6 text-gray-700">{report.targetRole ?? '—'}</td>
                    <td className="py-3 px-4 sm:px-6 text-gray-700">{report.company ?? '—'}</td>
                    <td className={`py-3 px-4 sm:px-6 font-semibold ${getScoreClass(report.overallScore)}`}>
                      {report.overallScore != null ? `${report.overallScore}%` : '—'}
                    </td>
                    <td className={`py-3 px-4 sm:px-6 font-semibold ${getScoreClass(report.jobMatchScore)}`}>
                      {report.jobMatchScore != null ? `${report.jobMatchScore}%` : '—'}
                    </td>
                  </tr>
                ))}
                {pagedReports.length === 0 && (
                  <tr>
                    <td className="py-6 px-4 sm:px-6 text-center text-gray-500" colSpan={6}>
                      No resume analysis reports yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-100 text-xs text-gray-600">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded border border-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded border border-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

