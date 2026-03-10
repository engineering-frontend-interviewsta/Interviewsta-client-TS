import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import type { VideoInterviewReport } from '../../../types/dashboard';
import { ROUTES } from '../../../constants/routerConstants';

interface VideoReportsCardProps {
  reports: VideoInterviewReport[];
  onReportClick?: (report: VideoInterviewReport) => void;
}

export default function VideoReportsCard({ reports, onReportClick }: VideoReportsCardProps) {
  const viewAllPath = ROUTES.VIDEO_INTERVIEW_REPORTS;
  const displayList = reports.slice(0, 3);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden min-h-[320px] flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-blue-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Video Interview Reports</h3>
          </div>
          <Link to={viewAllPath} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
                    <h4 className="font-bold text-gray-900 mb-1.5 text-sm truncate">{report.title}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg">{report.type}</span>
                      <span className="hidden sm:inline">{report.date}</span>
                      <span className="hidden sm:inline">{report.duration} min</span>
                      {report.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded-lg ${
                            report.difficulty === 'Easy'
                              ? 'bg-green-100 text-green-800'
                              : report.difficulty === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {report.difficulty}
                        </span>
                      )}
                    </div>
                    {report.topics && report.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {report.topics.slice(0, 2).map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs">
                            {topic}
                          </span>
                        ))}
                        {report.topics.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs">
                            +{report.topics.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {report.score != null && <div className="text-xl font-bold text-gray-900">{report.score}%</div>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center min-h-[200px] flex items-center justify-center">
            <p className="text-gray-500 font-medium">No video interview reports yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
