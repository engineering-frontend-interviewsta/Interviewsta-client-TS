import FeedbackReportSectionHeader from './FeedbackReportSectionHeader';

export type StrengthGapItem = {
  icon: string;
  title: string;
  body: string;
};

const DEFAULT_STRENGTHS: StrengthGapItem[] = [
  {
    icon: '💬',
    title: 'Technical Vocabulary',
    body: '8/10 — you used precise language (amortised, memoisation, adjacency list) without being prompted. This builds trust fast.',
  },
  {
    icon: '🗺',
    title: 'Problem Decomposition',
    body: '7/10 — you broke the problem into subproblems before coding, which is the FAANG gold standard. Don\'t let this slip under pressure.',
  },
  {
    icon: '🖐',
    title: 'Purposeful Gestures',
    body: 'Your hand movements reinforced your verbal explanations rather than distracting from them. Rare in candidates at this stage.',
  },
  {
    icon: '🎯',
    title: 'Constraint Awareness',
    body: 'You asked about input constraints before diving in — something many candidates skip. It signals senior-level thinking.',
  },
];

const DEFAULT_GAPS: StrengthGapItem[] = [
  {
    icon: '🧮',
    title: 'Complexity Analysis',
    body: 'Misanalysed time complexity twice. FAANG interviewers consider this a near-instant filter. Practice deriving O() from first principles, not intuition.',
  },
  {
    icon: '🔄',
    title: 'Alternative Solutions',
    body: 'You only proposed alternatives when directly prompted. Strong FAANG candidates proactively say "I could also approach this with X, but Y is better because…"',
  },
  {
    icon: '😶',
    title: 'Facial Composure Under Pressure',
    body: 'Visible stress on medium-difficulty questions reduces the interviewer\'s confidence in you — even when your answer is heading the right way.',
  },
  {
    icon: '🔇',
    title: 'Dead Silence Gaps',
    body: 'Two 8+ second silences scored as zero data for the AI and reads as freezing to a human. Bridge every pause with verbal narration.',
  },
];

export type FeedbackStrengthsPriorityGapsSectionProps = {
  strengths?: StrengthGapItem[];
  gaps?: StrengthGapItem[];
};

/** Section 05 — Strengths & priority gaps (two-column). */
export default function FeedbackStrengthsPriorityGapsSection({
  strengths = DEFAULT_STRENGTHS,
  gaps = DEFAULT_GAPS,
}: FeedbackStrengthsPriorityGapsSectionProps) {
  return (
    <div className="feedback-report-sections">
      <FeedbackReportSectionHeader
        eyebrow="05 — Strengths & Priority Gaps"
        title="What to build on, what to fix first"
      >
        Not all weaknesses are equal. The gaps marked below are the ones most likely to cost you the
        offer in your next attempt at this level.
      </FeedbackReportSectionHeader>

      <div className="str-gap-grid">
        <div>
          <div className="frs-str-col-title frs-str-col-title--green">✓ Genuine strengths</div>
          {strengths.length > 0 ? (
            <ul className="str-list">
              {strengths.map((s) => (
                <li key={s.title} className="str-item green">
                  <span className="str-icon" aria-hidden>
                    {s.icon}
                  </span>
                  <div className="str-text">
                    <strong>{s.title}</strong>
                    <span>{s.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="frs-empty-hint">No strengths listed in telemetry yet.</p>
          )}
        </div>
        <div>
          <div className="frs-str-col-title frs-str-col-title--amber">⚠ Priority gaps</div>
          {gaps.length > 0 ? (
            <ul className="str-list">
              {gaps.map((g) => (
                <li key={g.title} className="str-item amber">
                  <span className="str-icon" aria-hidden>
                    {g.icon}
                  </span>
                  <div className="str-text">
                    <strong>{g.title}</strong>
                    <span>{g.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="frs-empty-hint">No priority gaps listed in telemetry yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
