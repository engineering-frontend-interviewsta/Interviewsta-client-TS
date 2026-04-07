import type { ReactNode } from 'react';
import FeedbackReportSectionHeader from './FeedbackReportSectionHeader';

export type SpeechStatCell = {
  value: string;
  label: string;
  hint: string;
  tone: 'green' | 'amber' | 'red';
};

export type SpeechTimelineBlock = {
  kind: 'speak' | 'pause' | 'filler' | 'fast';
  widthPercent: number;
  label: string;
};

export type FillerTag = { text: string };

const DEFAULT_STATS: SpeechStatCell[] = [
  { value: '134', label: 'avg WPM', hint: '✓ Ideal range', tone: 'green' },
  { value: '8.2', label: 'fillers / min', hint: '↓ Target under 4', tone: 'amber' },
  { value: '2', label: 'dead pauses', hint: '>8 sec silence', tone: 'red' },
  { value: '91%', label: 'transcription confidence', hint: '✓ Clear audio', tone: 'green' },
];

const DEFAULT_TIMELINE: SpeechTimelineBlock[] = [
  { kind: 'speak', widthPercent: 12, label: 'Intro' },
  { kind: 'speak', widthPercent: 18, label: 'Q1 Solve' },
  { kind: 'pause', widthPercent: 4, label: '···' },
  { kind: 'filler', widthPercent: 5, label: 'Fillers' },
  { kind: 'speak', widthPercent: 14, label: 'Explain' },
  { kind: 'pause', widthPercent: 5, label: '···' },
  { kind: 'speak', widthPercent: 10, label: 'Q2 Start' },
  { kind: 'fast', widthPercent: 8, label: 'Fast' },
  { kind: 'speak', widthPercent: 12, label: 'Recovery' },
  { kind: 'pause', widthPercent: 3, label: '·' },
  { kind: 'speak', widthPercent: 9, label: 'Wrap-up' },
];

const DEFAULT_FILLERS: FillerTag[] = [
  { text: '"um" — 48×' },
  { text: '"like" — 31×' },
  { text: '"you know" — 14×' },
  { text: '"basically" — 11×' },
  { text: '"so yeah" — 7×' },
];

function blockClass(kind: SpeechTimelineBlock['kind']) {
  if (kind === 'speak') return 'speech-block sb-speak';
  if (kind === 'pause') return 'speech-block sb-pause';
  if (kind === 'filler') return 'speech-block sb-filler';
  return 'speech-block sb-fast';
}

export type FeedbackSpeechVocalSectionProps = {
  stats?: SpeechStatCell[];
  timelineLabel?: string;
  timeline?: SpeechTimelineBlock[];
  fillers?: FillerTag[];
  callout?: ReactNode;
};

/** Section 03 — Speech & vocal analysis with timeline (experimental TestFeedback parity). */
export default function FeedbackSpeechVocalSection({
  stats = DEFAULT_STATS,
  timelineLabel = '42-minute speech timeline',
  timeline = DEFAULT_TIMELINE,
  fillers = DEFAULT_FILLERS,
  callout = (
    <>
      <strong>Why this matters:</strong> Filler words at 8.2/min signal to an AI scorer that
      you&apos;re processing publicly rather than privately — it reduces the perceived confidence of
      your answer. The &quot;basically&quot; and &quot;so yeah&quot; patterns are specifically
      associated with trailing off from an explanation without landing. Record yourself and target
      &lt;4/min.
    </>
  ),
}: FeedbackSpeechVocalSectionProps) {
  return (
    <div className="feedback-report-sections">
      <FeedbackReportSectionHeader eyebrow="03 — Speech & Vocal Analysis" title="How your words landed">
        Analysed from audio transcript via speaker diarisation and prosody detection. Speech quality
        directly impacts 3 of your 4 communication rubric scores. A technically correct answer
        delivered haltingly or too fast reads as less correct.
      </FeedbackReportSectionHeader>

      <div className="card">
        <div className="frs-speech-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="frs-speech-stat-cell">
              <div className={`frs-speech-stat-val frs-speech-stat-val--${s.tone}`}>{s.value}</div>
              <div className="frs-speech-stat-label">{s.label}</div>
              <div className={`frs-speech-stat-hint frs-speech-stat-hint--${s.tone}`}>{s.hint}</div>
            </div>
          ))}
        </div>

        <div className="frs-timeline-label">{timelineLabel}</div>
        <div className="speech-timeline" role="img" aria-label="Speech timeline across the session">
          {timeline.map((b, i) => (
            <div
              key={`${b.kind}-${i}-${b.label}`}
              className={blockClass(b.kind)}
              style={{ width: `${b.widthPercent}%` }}
            >
              {b.label}
            </div>
          ))}
        </div>
        <div className="timeline-legend">
          <div className="tl-item">
            <div className="tl-dot" style={{ background: '#3d8b6e' }} />
            Normal speech
          </div>
          <div className="tl-item">
            <div className="tl-dot" style={{ background: 'var(--bg3)' }} />
            Pause / silence
          </div>
          <div className="tl-item">
            <div className="tl-dot" style={{ background: '#b45309' }} />
            High filler density
          </div>
          <div className="tl-item">
            <div className="tl-dot" style={{ background: '#c2410c' }} />
            Too fast (&gt;170 WPM)
          </div>
        </div>

        <div className="frs-divider" />

        <div className="frs-fillers-heading">Top filler words detected</div>
        {fillers.length > 0 ? (
          <div className="frs-filler-tags">
            {fillers.map((f) => (
              <span key={f.text} className="frs-filler-tag">
                {f.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="frs-empty-hint">No filler word breakdown in telemetry yet.</p>
        )}

        {callout != null ? <div className="frs-speech-callout">{callout}</div> : null}
      </div>
    </div>
  );
}
