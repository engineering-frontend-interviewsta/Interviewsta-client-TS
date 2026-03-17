import { Link } from 'react-router-dom';
import { ChevronRight, FileUp, FileText } from 'lucide-react';
import type { ResumeReport } from '../../../types/dashboard';
import { ROUTES } from '../../../constants/routerConstants';
import './VideoReportsCard.css';
import './ResumeReportsCard.css';

interface ResumeReportsCardProps {
  reports: ResumeReport[];
  onReportClick?: (report: ResumeReport) => void;
}

export default function ResumeReportsCard({ reports, onReportClick }: ResumeReportsCardProps) {
  const viewAllPath = ROUTES.RESUME_ANALYSIS_REPORTS;
  const displayList = reports.slice(0, 3);

  return (
    <article className="reports-card">
      <div className="reports-card__accent" aria-hidden />
      <div className="reports-card__body">
        <div className="reports-card__header">
          <div className="reports-card__title-row">
            <span className="reports-card__title-icon" aria-hidden><FileText size={18} strokeWidth={2} /></span>
            <h3 className="reports-card__title">Resume Analysis Reports</h3>
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
                    <h4 className="reports-card__item-title">{report.fileName}</h4>
                    <p className="reports-card__item-meta">
                      {[report.date, report.targetRole, report.company].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <div className="reports-card__item-meta-block">
                    {report.overallScore != null && (
                      <span className="reports-card__item-score">{report.overallScore}%</span>
                    )}
                    {report.jobMatchScore != null && (
                      <span className="reports-card__item-score-secondary">{report.jobMatchScore}% match</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="reports-card__empty">
            <span className="reports-card__empty-icon" aria-hidden><FileUp size={32} strokeWidth={1.5} /></span>
            <p className="reports-card__empty-text">No resume analysis reports yet</p>
            <Link to={ROUTES.RESUME_ANALYSIS} className="reports-card__empty-cta">
              Upload your first resume
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
