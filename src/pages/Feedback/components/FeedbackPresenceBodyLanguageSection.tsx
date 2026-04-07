import FeedbackReportSectionHeader from './FeedbackReportSectionHeader';

export type PresenceStatRow = { label: string; value: string; tone?: 'good' | 'warn' | 'bad' };

export type PresenceCardData = {
  title: string;
  subtitle: string;
  scoreLabel: string;
  badgeClass: 'badge-green' | 'badge-amber' | 'badge-red' | 'badge-blue';
  stats: PresenceStatRow[];
  narrative: string;
};

const DEFAULT_CARDS: PresenceCardData[] = [
  {
    title: 'Eye Contact & Gaze',
    subtitle: 'Camera vs. screen vs. downward',
    scoreLabel: '62%',
    badgeClass: 'badge-amber',
    stats: [
      { label: 'Camera gaze', value: '51% of session', tone: 'warn' },
      { label: 'Screen / notes', value: '34%' },
      { label: 'Downward drift', value: '15% — frequent', tone: 'bad' },
      { label: 'Longest drop', value: '48 seconds (min 28)', tone: 'bad' },
    ],
    narrative:
      'You spent a significant amount of time looking at the code editor rather than the camera — this is natural but reads as low confidence to the interviewer. Your downward gaze spikes coincided with the two moments you were stuck.',
  },
  {
    title: 'Posture & Head Stability',
    subtitle: 'Spine alignment, rocking, head tilt',
    scoreLabel: '67%',
    badgeClass: 'badge-amber',
    stats: [
      { label: 'Upright frames', value: '72% of session', tone: 'good' },
      { label: 'Forward lean', value: '18% — good signal', tone: 'good' },
      { label: 'Slouch events', value: '6 detected (>3s each)', tone: 'warn' },
      { label: 'Head rocking', value: 'Mild — under threshold', tone: 'warn' },
    ],
    narrative:
      'Your posture was good in the first 15 minutes then noticeably deteriorated. The 6 slouch events all occurred after minute 22 — likely fatigue. FAANG interviews run 45–60 min, so stamina matters.',
  },
  {
    title: 'Facial Expression & Affect',
    subtitle: 'Confidence, stress, composure signals',
    scoreLabel: '54%',
    badgeClass: 'badge-red',
    stats: [
      { label: 'Neutral/positive', value: '62% of session', tone: 'warn' },
      { label: 'Stress markers', value: '4 distinct events', tone: 'bad' },
      { label: 'Brow furrow', value: 'Detected on Q1 & Q2', tone: 'bad' },
      { label: 'Smile / warmth', value: 'Only at intro', tone: 'warn' },
    ],
    narrative:
      'You visibly showed stress when presented with the harder variant of the graph problem. Interviewers interpret a tense face as uncertainty even when your solution is on the right track. Practise a "calm face" as a deliberate skill.',
  },
  {
    title: 'Hand Gestures & Fidgeting',
    subtitle: 'Movement patterns via pose landmarks',
    scoreLabel: '73%',
    badgeClass: 'badge-green',
    stats: [
      { label: 'Purposeful gestures', value: 'Frequently used', tone: 'good' },
      { label: 'Face touching', value: '7 times (mild concern)', tone: 'warn' },
      { label: 'Hair touching', value: '3 events — anxiety marker', tone: 'warn' },
      { label: 'Visible fidget', value: 'None detected', tone: 'good' },
    ],
    narrative:
      'Your hand gestures were actually a strength — they reinforced your explanations effectively. The face and hair touching are mild self-soothing behaviours that spike during difficult questions; awareness alone usually reduces them.',
  },
];

function statClass(tone?: PresenceStatRow['tone']) {
  if (tone === 'good') return 'ps-val good';
  if (tone === 'warn') return 'ps-val warn';
  if (tone === 'bad') return 'ps-val bad';
  return 'ps-val';
}

export type FeedbackPresenceBodyLanguageSectionProps = {
  cards?: PresenceCardData[];
};

/** Section 02 — Physical presence & body language (MediaPipe-style mock layout). */
export default function FeedbackPresenceBodyLanguageSection({
  cards = DEFAULT_CARDS,
}: FeedbackPresenceBodyLanguageSectionProps) {
  return (
    <div className="feedback-report-sections">
      <FeedbackReportSectionHeader
        eyebrow="02 — Physical Presence & Body Language"
        title="What your body was saying"
      >
        Measured via MediaPipe face mesh and pose detection. Your interviewer picks up on these signals
        in the first 60 seconds — often before you&apos;ve said a word. Presence doesn&apos;t override
        technical skill, but it modulates how much benefit of the doubt you get when you&apos;re
        uncertain.
      </FeedbackReportSectionHeader>

      <div className="presence-grid">
        {cards.map((c) => (
          <div key={c.title} className="presence-card">
            <div className="presence-card__header">
              <div>
                <div className="presence-card__title">{c.title}</div>
                <div className="presence-card__sub">{c.subtitle}</div>
              </div>
              <span className={`score-badge ${c.badgeClass}`}>{c.scoreLabel}</span>
            </div>
            {c.stats.map((row) => (
              <div key={row.label} className="presence-stat-row">
                <span className="ps-key">{row.label}</span>
                <span className={statClass(row.tone)}>{row.value}</span>
              </div>
            ))}
            <div className="presence-narrative">{c.narrative}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
