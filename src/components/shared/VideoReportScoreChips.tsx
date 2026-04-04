import type { VideoInterviewReport } from '../../types/dashboard';
import './VideoReportScoreChips.css';
import { buildVideoReportScoreRows } from '../../utils/videoReportScores';

type Variant = 'card' | 'table';

export default function VideoReportScoreChips({
  report,
  variant = 'card',
}: {
  report: VideoInterviewReport;
  variant?: Variant;
}) {
  const rows = buildVideoReportScoreRows(report);
  if (rows.length === 0) {
    return (
      <span className={`video-report-chips video-report-chips--empty${variant === 'card' ? ' video-report-chips--empty-card' : ''}`}>
        —
      </span>
    );
  }

  return (
    <div
      className={`video-report-chips${variant === 'table' ? ' video-report-chips--table' : ''}`}
      role="list"
      aria-label="Score breakdown"
    >
      {rows.map((r) => (
        <span
          key={r.fullLabel}
          className="video-report-chips__chip"
          title={`${r.fullLabel}: ${r.score}%`}
          role="listitem"
        >
          <span className="video-report-chips__chip-label">{r.shortLabel}</span>
          <span className="video-report-chips__chip-value">{r.score}%</span>
        </span>
      ))}
    </div>
  );
}
