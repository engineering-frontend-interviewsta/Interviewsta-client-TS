import type { InterviewFeedback } from '../../../types/feedback';
import {
  computeSleeveScore,
  formatSleeveLabel,
  getUniversalScoreSupplements,
  scorePercentTier,
  scoreTierLabel,
} from '../reportUtils';

const RING_R = 64;
const RING_C = 2 * Math.PI * RING_R;

interface FeedbackHeroProps {
  metaTitle: string;
  interviewKind: string;
  duration?: string;
  data: InterviewFeedback;
}

export default function FeedbackHero({
  metaTitle,
  interviewKind,
  duration,
  data,
}: FeedbackHeroProps) {
  const rawOverall = data.overallScore;
  const overall =
    rawOverall != null && rawOverall >= 0 ? Math.round(rawOverall) : null;
  const ringOffset =
    overall != null ? RING_C * (1 - Math.min(100, Math.max(0, overall)) / 100) : RING_C;

  const items = data.items && typeof data.items === 'object' ? data.items : {};
  const pillEntries = Object.entries(items).slice(0, 6);
  const universalSupplements = getUniversalScoreSupplements(data);

  return (
    <header className="feedback-report__hero">
      <div className="feedback-report__hero-meta feedback-report__mono">
        <span>{metaTitle}</span>
        <span className="feedback-report__hero-meta-dot" aria-hidden />
        <span>{interviewKind}</span>
        {duration ? (
          <>
            <span className="feedback-report__hero-meta-dot" aria-hidden />
            <span>{duration}</span>
          </>
        ) : null}
      </div>
      <h1 className="feedback-report__hero-title">
        Your <em>Interview Report</em>
      </h1>
      <p className="feedback-report__hero-sub">
        Structured view of how you showed up across rubric dimensions: technical depth,
        clarity, and conversation flow — aligned with how hiring loops score candidates.
      </p>

      <div className="feedback-report__hero-scores">
        <div className="feedback-report__ring-wrap">
          <svg
            width={160}
            height={160}
            viewBox="0 0 160 160"
            aria-hidden
            className="feedback-report__fade-up"
          >
            <circle
              cx={80}
              cy={80}
              r={RING_R}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={10}
            />
            {overall != null && (
              <circle
                cx={80}
                cy={80}
                r={RING_R}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={10}
                strokeDasharray={RING_C}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            )}
            <text
              x={80}
              y={72}
              textAnchor="middle"
              className="feedback-report__font-display"
              style={{ fontSize: 34, fill: 'var(--color-text)' }}
            >
              {overall != null ? `${overall}%` : '—'}
            </text>
            <text
              x={80}
              y={92}
              textAnchor="middle"
              className="feedback-report__mono"
              style={{
                fontSize: 10,
                fill: 'var(--color-text-subtle)',
                letterSpacing: '0.12em',
              }}
            >
              OVERALL
            </text>
          </svg>
          <span className="feedback-report__ring-label">Composite score</span>
          <span className="feedback-report__ring-sublabel">
            Aggregated from rubric dimensions below
          </span>
        </div>

        <div className="feedback-report__score-pills">
            {pillEntries.map(([key, metrics]) => {
              const m = metrics || {};
              const sleeveScore =
                data.sleeveScore != null && key in data.sleeveScore
                  ? data.sleeveScore[key]
                  : computeSleeveScore(m);
              const rounded = Math.round(sleeveScore);
              const tier = scorePercentTier(rounded);
              const valClass =
                tier === 'high'
                  ? 'feedback-report__score-pill-val feedback-report__score-pill-val--high'
                  : tier === 'mid'
                    ? 'feedback-report__score-pill-val feedback-report__score-pill-val--mid'
                    : 'feedback-report__score-pill-val feedback-report__score-pill-val--low';
              return (
                <div key={key} className="feedback-report__score-pill feedback-report__fade-up">
                <span className="feedback-report__score-pill-label feedback-report__mono">
                  {formatSleeveLabel(key)}
                </span>
                <span className={valClass}>{rounded}%</span>
                <span className="feedback-report__score-pill-sub">
                  {scoreTierLabel(tier)}
                </span>
              </div>
            );
          })}
          {pillEntries.length === 0 && overall != null && (
            <div className="feedback-report__score-pill feedback-report__fade-up">
              <span className="feedback-report__score-pill-label feedback-report__mono">
                Overall
              </span>
              <span className="feedback-report__score-pill-val feedback-report__score-pill-val--high">
                {overall}%
              </span>
              <span className="feedback-report__score-pill-sub">
                {scoreTierLabel(scorePercentTier(overall))}
              </span>
            </div>
          )}
          {universalSupplements.map((supplement) => {
            const rounded = Math.round(supplement.score);
            const tier = scorePercentTier(rounded);
            const valClass =
              tier === 'high'
                ? 'feedback-report__score-pill-val feedback-report__score-pill-val--high'
                : tier === 'mid'
                  ? 'feedback-report__score-pill-val feedback-report__score-pill-val--mid'
                  : 'feedback-report__score-pill-val feedback-report__score-pill-val--low';
            return (
              <div key={supplement.key} className="feedback-report__score-pill feedback-report__fade-up">
                <span className="feedback-report__score-pill-label feedback-report__mono">
                  {supplement.label}
                </span>
                <span className={valClass}>{rounded}%</span>
                <span className="feedback-report__score-pill-sub">
                  {scoreTierLabel(tier)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
