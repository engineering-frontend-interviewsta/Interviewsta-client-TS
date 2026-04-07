import FeedbackReportSectionHeader from './FeedbackReportSectionHeader';

export type EnvironmentItem = {
  icon: string;
  label: string;
  verdict: string;
  dotClass: 'env-good' | 'env-warn' | 'env-bad';
  note: string;
};

const DEFAULT_ITEMS: EnvironmentItem[] = [
  {
    icon: '💡',
    label: 'Lighting',
    verdict: 'Fair',
    dotClass: 'env-warn',
    note: 'Backlight detected from a window behind you. Face brightness variance was 34% — ideal is under 15%.',
  },
  {
    icon: '📷',
    label: 'Camera angle',
    verdict: 'Below eye level',
    dotClass: 'env-bad',
    note: 'Camera was approx 12° below eye level — upward angle detected. Raise your laptop by ~10cm.',
  },
  {
    icon: '🏠',
    label: 'Background',
    verdict: 'Clean',
    dotClass: 'env-good',
    note: 'No distracting elements detected. Good neutral background throughout.',
  },
  {
    icon: '🔊',
    label: 'Background noise',
    verdict: 'Moderate',
    dotClass: 'env-warn',
    note: 'Fan noise detected at ~32dB average. 3 external audio events (door, notification). Use earphones with mic.',
  },
  {
    icon: '🎙',
    label: 'Microphone',
    verdict: 'Built-in laptop',
    dotClass: 'env-warn',
    note: 'Room echo detected — hollow reverb on voice. External mic or earphones would reduce this significantly.',
  },
  {
    icon: '👔',
    label: 'Attire',
    verdict: 'Appropriate',
    dotClass: 'env-good',
    note: 'Solid colour, no pattern moiré, smart casual. Consistent with FAANG video interview expectations.',
  },
];

export type FeedbackEnvironmentSectionProps = {
  items?: EnvironmentItem[];
};

/** Section 04 — Environment quality grid. */
export default function FeedbackEnvironmentSection({ items = DEFAULT_ITEMS }: FeedbackEnvironmentSectionProps) {
  return (
    <div className="feedback-report-sections">
      <FeedbackReportSectionHeader
        eyebrow="04 — Environment Quality"
        title="Your setup was working against you"
      >
        The environment score affects how much signal the AI can extract from you. Poor lighting reduces
        facial expression accuracy. Echo reduces transcription confidence. These aren&apos;t soft
        observations — they degrade every other score on this page.
      </FeedbackReportSectionHeader>

      <div className="env-grid">
        {items.map((it) => (
          <div key={it.label} className="env-item">
            <div className="env-item__icon" aria-hidden>
              {it.icon}
            </div>
            <div className="env-item__label">{it.label}</div>
            <div className="env-item__val">
              <span className={`env-dot ${it.dotClass}`} />
              {it.verdict}
            </div>
            <div className="env-item__note">{it.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
