import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';

function LockedSkeletonScore() {
  return (
    <div className="feedback-report__locked-skeleton feedback-report__locked-skeleton--score">
      <div className="feedback-report__locked-skeleton-radar" />
      <div className="feedback-report__locked-skeleton-metrics">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="feedback-report__locked-skeleton-metric">
            <div className="feedback-report__locked-skeleton-line feedback-report__locked-skeleton-line--short" />
            <div className="feedback-report__locked-skeleton-bar" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LockedSkeletonSummary() {
  return (
    <div className="feedback-report__locked-skeleton feedback-report__locked-skeleton--summary">
      <div className="feedback-report__locked-skeleton-cols">
        <div className="feedback-report__locked-skeleton-col">
          <div className="feedback-report__locked-skeleton-line feedback-report__locked-skeleton-line--label" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="feedback-report__locked-skeleton-pill" />
          ))}
        </div>
        <div className="feedback-report__locked-skeleton-col">
          <div className="feedback-report__locked-skeleton-line feedback-report__locked-skeleton-line--label" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="feedback-report__locked-skeleton-pill" />
          ))}
        </div>
      </div>
    </div>
  );
}

function LockedSkeletonTranscript() {
  return (
    <div className="feedback-report__locked-skeleton feedback-report__locked-skeleton--transcript">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`feedback-report__locked-skeleton-line feedback-report__locked-skeleton-line--tx-${i}`} />
      ))}
    </div>
  );
}

function LockedSkeletonInsights() {
  return (
    <div className="feedback-report__locked-skeleton feedback-report__locked-skeleton--insights">
      <div className="feedback-report__locked-skeleton-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="feedback-report__locked-skeleton-tile">
            <div className="feedback-report__locked-skeleton-line feedback-report__locked-skeleton-line--short" />
            <div className="feedback-report__locked-skeleton-line" />
            <div className="feedback-report__locked-skeleton-line feedback-report__locked-skeleton-line--medium" />
          </div>
        ))}
      </div>
    </div>
  );
}

type LockedSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  overlayTitle?: string;
  overlayBody?: string;
  children: ReactNode;
};

function LockedSection({
  eyebrow,
  title,
  description,
  overlayTitle,
  overlayBody,
  children,
}: LockedSectionProps) {
  return (
    <>
      <header className="feedback-report__section-header">
        <div className="feedback-report__eyebrow feedback-report__mono">{eyebrow}</div>
        <h2 className="feedback-report__section-title">{title}</h2>
        {description ? <p className="feedback-report__section-desc">{description}</p> : null}
      </header>
      <div className="feedback-report__card feedback-report__locked-card">
        <div className="feedback-report__locked-card-inner" aria-hidden>
          {children}
        </div>
        <div
          className="feedback-report__locked-card-veil"
          role="status"
          aria-label={
            overlayTitle
              ? `${overlayTitle}. ${overlayBody ?? ''}`
              : 'This section is locked. Add credits to unlock.'
          }
        >
          <Lock className="feedback-report__locked-card-lock" size={26} strokeWidth={2} aria-hidden />
          {overlayTitle ? <span className="feedback-report__locked-card-title">{overlayTitle}</span> : null}
          {overlayBody ? <span className="feedback-report__locked-card-sub">{overlayBody}</span> : null}
        </div>
      </div>
    </>
  );
}

/** Mirrors unlocked report sections with skeleton + blurred placeholder content and lock overlays. */
export default function LockedFeedbackPreview() {
  return (
    <div className="feedback-report__body">
      <LockedSection
        eyebrow="01 — Score breakdown"
        title="How each dimension scored"
        description="Rubric scores across technical dimensions plus communication and grammar where applicable."
        overlayTitle="Detailed feedback is locked"
        overlayBody="This was your complimentary first interview. Add credits to unlock scores and full analysis."
      >
        <LockedSkeletonScore />
      </LockedSection>

      <LockedSection
        eyebrow="02 — Summary"
        title="Strengths & growth areas"
        description="Highlights what came through strongly in your session and where a bit more polish would move the needle in a real loop."
      >
        <LockedSkeletonSummary />
      </LockedSection>

      <LockedSection
        eyebrow="03 — Transcript"
        title="Interview transcript"
        description="Full dialogue from this session."
      >
        <LockedSkeletonTranscript />
      </LockedSection>

      <LockedSection
        eyebrow="04 — Session insights"
        title="Presence, speech & environment"
        description="Deeper signals from your session when telemetry is available."
      >
        <LockedSkeletonInsights />
      </LockedSection>
    </div>
  );
}
