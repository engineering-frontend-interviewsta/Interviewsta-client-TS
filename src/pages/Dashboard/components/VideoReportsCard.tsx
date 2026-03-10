import { Link } from 'react-router-dom';
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
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Video Interview Reports</h3>
        <Link to={viewAllPath} className="text-blue-600 hover:underline text-xs font-medium">
          View All
        </Link>
      </div>
      <div className="flex-1">
        {displayList.length > 0 ? (
          <ul className="space-y-2">
            {displayList.map((report) => (
              <li
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => onReportClick?.(report)}
                onKeyDown={(e) => e.key === 'Enter' && onReportClick?.(report)}
                className="border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50 text-sm"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{report.title}</h4>
                    <p className="text-xs text-gray-600">
                      {report.type} · {report.date} · {report.duration} min
                    </p>
                  </div>
                  {report.score != null && (
                    <div className="text-sm font-semibold text-gray-900 flex-shrink-0">{report.score}%</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 text-center py-6">No video interview reports yet</p>
        )}
      </div>
    </div>
  );
}
