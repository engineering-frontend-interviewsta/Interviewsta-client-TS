import { Link } from 'react-router-dom';
import { ChevronRight, VideoOff, Video as VideoIcon } from 'lucide-react';
import type { VideoInterviewReport } from '../../../types/dashboard';
import { ROUTES } from '../../../constants/routerConstants';
import './VideoReportsCard.css';

interface VideoReportsCardProps {
  reports: VideoInterviewReport[];
  onReportClick?: (report: VideoInterviewReport) => void;
}

export default function VideoReportsCard({ reports, onReportClick }: VideoReportsCardProps) {
  const viewAllPath = ROUTES.VIDEO_INTERVIEW_REPORTS;
  const displayList = reports.slice(0, 3);

  return (
    <article className="reports-card">
      <div className="reports-card__accent" aria-hidden />
      <div className="reports-card__body">
        <div className="reports-card__header">
          <div className="reports-card__title-row">
            <span className="reports-card__title-icon" aria-hidden><VideoIcon size={18} strokeWidth={2} /></span>
            <h3 className="reports-card__title">Video Interview Reports</h3>
          </div>
          <Link to={viewAllPath} className="reports-card__view-all">
            View all
            <span className="reports-card__view-all-arrow" aria-hidden><ChevronRight size={14} /></span>
          </Link>
        </div>
      {displayList.length > 0 ? (
          <ul className="reports-card__list">
            {displayList.map((report) => (
              <li
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => onReportClick?.(report)}
                onKeyDown={(e) => e.key === 'Enter' && onReportClick?.(report)}
                className="reports-card__item"
              >
                <div className="reports-card__item-inner">
                  <div className="reports-card__item-content">
                    <h4 className="reports-card__item-title">{report.title}</h4>
                    <p className="reports-card__item-meta">
                      {report.type} · {report.date} · {report.duration} min
                    </p>
                  </div>
                  {report.score != null && (
                    <span className="reports-card__item-score">{report.score}%</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="reports-card__empty">
            <span className="reports-card__empty-icon" aria-hidden><VideoOff size={32} strokeWidth={1.5} /></span>
            <p className="reports-card__empty-text">No video interview reports yet</p>
            <p className="reports-card__empty-hint">Complete an interview to see your report here.</p>
          </div>
        )}
      </div>
    </article>
  );
}
