import type { InterviewFeedback } from '../../../types/feedback';
import {
  computeCompositeScorePercent,
  computeSleeveScoreForDisplay,
  formatSleeveTitleForDisplay,
  getCommunicationMetricsView,
  getGrammarMetricsView,
  languageMetricsViewOverall,
  orderTechnicalItemsEntries,
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
  const commView = getCommunicationMetricsView(data.communicationMetrics);
  const gramView = getGrammarMetricsView(data.grammarMetrics);

  const composite =
    computeCompositeScorePercent(data) ??
    (data.overallScore != null && data.overallScore >= 0 ? Math.round(data.overallScore) : null);

  const ringOffset =
    composite != null ? RING_C * (1 - Math.min(100, Math.max(0, composite)) / 100) : RING_C;

  const items = data.items && typeof data.items === 'object' ? data.items : {};
  const technicalEntries = orderTechnicalItemsEntries(
    Object.entries(items) as [string, Record<string, number>][],
  );
  const sleevePills = technicalEntries.map(([key, metrics]) => ({
    key,
    label: formatSleeveTitleForDisplay(key),
    score: Math.round(computeSleeveScoreForDisplay(key, metrics || {})),
  }));

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
        Structured view of how you showed up across technical execution, problem-solving, clarity of
        explanation, and language quality — aligned with how hiring loops evaluate candidates.
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
            {composite != null && (
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
              {composite != null ? `${composite}%` : '—'}
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
            Technical categories first, then communication and grammar
          </span>
        </div>

        <div className="feedback-report__score-pills">
          {sleevePills.map((p) => (
            <HeroPill key={p.key} label={p.label} score={p.score} />
          ))}
          {commView && (
            <HeroPill label="Communication" score={Math.round(languageMetricsViewOverall(commView))} />
          )}
          {gramView && (
            <HeroPill label="Grammar" score={Math.round(languageMetricsViewOverall(gramView))} />
          )}
          {sleevePills.length === 0 && !commView && !gramView && composite != null && (
            <HeroPill label="Overall" score={composite} />
          )}
        </div>
      </div>
    </header>
  );
}

function HeroPill({ label, score }: { label: string; score: number }) {
  const tier = scorePercentTier(score);
  const valClass =
    tier === 'high'
      ? 'feedback-report__score-pill-val feedback-report__score-pill-val--high'
      : tier === 'mid'
        ? 'feedback-report__score-pill-val feedback-report__score-pill-val--mid'
        : 'feedback-report__score-pill-val feedback-report__score-pill-val--low';
  return (
    <div
      className="feedback-report__score-pill feedback-report__fade-up"
      title={
        score === 0
          ? `${label}: 0% — evaluated score (not the same as “not evaluated”)`
          : `${label}: ${score}%`
      }
    >
      <span className="feedback-report__score-pill-label feedback-report__mono">{label}</span>
      <span className={valClass}>{score}%</span>
      <span className="feedback-report__score-pill-sub">
        {score === 0 ? 'Scored (0%)' : scoreTierLabel(tier)}
      </span>
    </div>
  );
}
