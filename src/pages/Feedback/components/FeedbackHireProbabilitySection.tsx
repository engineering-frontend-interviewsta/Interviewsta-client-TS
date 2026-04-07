import type { ReactNode } from 'react';
import FeedbackReportSectionHeader from './FeedbackReportSectionHeader';

export type HireBreakdownItem = {
  label: string;
  value: string;
  valueClass: 'val-green' | 'val-amber' | 'val-red' | 'val-blue';
};

export type HireTipCard = {
  variant: 'green' | 'blue' | 'amber';
  label: string;
  value: string;
  sub: string;
};

const DEFAULT_BREAKDOWN: HireBreakdownItem[] = [
  { label: 'Technical Score', value: '58%', valueClass: 'val-amber' },
  { label: 'Presence Score', value: '64%', valueClass: 'val-amber' },
  { label: 'Speech Score', value: '71%', valueClass: 'val-green' },
  { label: 'Environment', value: '44%', valueClass: 'val-red' },
];

const DEFAULT_TIPS: HireTipCard[] = [
  {
    variant: 'green',
    label: 'If you fix complexity errors',
    value: '+18%',
    sub: 'hire probability gain',
  },
  {
    variant: 'blue',
    label: 'If you cut fillers to <4/min',
    value: '+7%',
    sub: 'hire probability gain',
  },
  {
    variant: 'amber',
    label: 'If you fix your environment',
    value: '+5%',
    sub: 'hire probability gain',
  },
];

const DEFAULT_NARRATIVE: ReactNode = (
  <>
    Your communication profile is genuinely strong — a 7.0 average in the Comms category puts you ahead
    of ~60% of candidates at this stage. The problem is that FAANG interviewers do a holistic
    calibration, and your <strong>system thinking (4.5/10)</strong> and{' '}
    <strong>complexity analysis errors</strong> would likely trigger a &quot;No Hire&quot; from a
    senior engineer, regardless of how well you communicated. The good news: these are learnable
    skills, not aptitude gaps. If you bring the algorithmic category to a 7+ average in your next
    session, the hire probability jumps to roughly <strong>65–70%</strong>.
  </>
);

export type FeedbackHireProbabilitySectionProps = {
  verdictLines?: ReactNode;
  hireProbabilityPercent?: string;
  breakdown?: HireBreakdownItem[];
  /** Omit for mock copy; pass `null` to hide the narrative block (e.g. telemetry with no text). */
  narrative?: ReactNode | null;
  tipsHeading?: string;
  /** Pass `[]` to hide impact cards; omit to use built-in mock tips (standalone demos). */
  tips?: HireTipCard[];
};

/** Section 06 — Hire probability, breakdown, narrative, and “what would change” tips. */
export default function FeedbackHireProbabilitySection({
  verdictLines = (
    <>
      Strong communicator,
      <br />
      <em>not yet at FAANG bar</em>
      <br />
      technically.
    </>
  ),
  hireProbabilityPercent = '38%',
  breakdown,
  narrative,
  tipsHeading = 'What would change the outcome',
  tips,
}: FeedbackHireProbabilitySectionProps) {
  const tipList = tips === undefined ? DEFAULT_TIPS : tips;
  const breakdownList = breakdown === undefined ? DEFAULT_BREAKDOWN : breakdown;
  const narrativeBody = narrative === undefined ? DEFAULT_NARRATIVE : narrative;

  return (
    <div className="feedback-report-sections">
      <FeedbackReportSectionHeader eyebrow="06 — Hire Probability" title="Where you stand and why" />

      <div className="hire-section">
        <div className="hire-header">
          <div className="hire-verdict">{verdictLines}</div>
          <div className="hire-prob-display">
            <div className="hire-prob-num">{hireProbabilityPercent}</div>
            <div className="hire-prob-label">estimated pass probability</div>
            <div className="hire-prob-label hire-prob-meta">at current performance level</div>
          </div>
        </div>

        {breakdownList.length > 0 ? (
          <div className="hire-breakdown">
            {breakdownList.map((b) => (
              <div key={b.label} className="hb-item">
                <div className={`hb-val ${b.valueClass}`}>{b.value}</div>
                <div className="hb-label">{b.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {narrativeBody != null ? <div className="hire-narrative">{narrativeBody}</div> : null}

        {tipList.length > 0 ? (
          <>
            <div className="frs-hire-tips-heading">{tipsHeading}</div>
            <div className="frs-hire-tips-grid">
              {tipList.map((t) => (
                <div
                  key={t.label}
                  className={`frs-hire-tip-card frs-hire-tip-card--${t.variant}`}
                >
                  <div className={`frs-hire-tip-label frs-hire-tip-label--${t.variant}`}>{t.label}</div>
                  <div className={`frs-hire-tip-val frs-hire-tip-val--${t.variant}`}>{t.value}</div>
                  <div className="frs-hire-tip-sub">{t.sub}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
