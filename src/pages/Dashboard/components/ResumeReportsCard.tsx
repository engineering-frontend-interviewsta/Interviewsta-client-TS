import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { ResumeReport } from '../../../types/dashboard';
import { ROUTES } from '../../../constants/routerConstants';

interface ResumeReportsCardProps {
  reports: ResumeReport[];
  onReportClick?: (report: ResumeReport) => void;
}

export default function ResumeReportsCard({ reports, onReportClick }: ResumeReportsCardProps) {
  const viewAllPath = ROUTES.RESUME_ANALYSIS_REPORTS;
  const displayList = reports.slice(0, 3);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden min-h-[320px] flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-violet-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Resume Analysis Reports</h3>
          </div>
          <Link to={viewAllPath} className="text-violet-600 hover:text-violet-700 text-sm font-medium">
            View All
          </Link>
        </div>
      </div>
      <div className="p-5 flex-1">
        {displayList.length > 0 ? (
          <ul className="space-y-3">
            {displayList.map((report) => (
              <li
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => onReportClick?.(report)}
                onKeyDown={(e) => e.key === 'Enter' && onReportClick?.(report)}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1.5 text-sm truncate">{report.fileName}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 mb-3">
                      <span className="hidden sm:inline">{report.date}</span>
                      {report.targetRole && (
                        <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-lg">{report.targetRole}</span>
                      )}
                      {report.company && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">{report.company}</span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block">Overall</span>
                        <span className="text-lg font-bold text-gray-900">{report.overallScore ?? '—'}%</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Job Match</span>
                        <span className="text-lg font-bold text-gray-900">{report.jobMatchScore ?? '—'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center min-h-[200px] flex items-center justify-center">
            <p className="text-gray-500 font-medium">No resume analysis reports yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
