export interface FreeInterviewTimeLimitModalProps {
  open: boolean;
  onEndAndViewFeedback: () => void;
  onBuyCredits: () => void;
  isEnding: boolean;
}

export default function FreeInterviewTimeLimitModal({
  open,
  onEndAndViewFeedback,
  onBuyCredits,
  isEnding,
}: FreeInterviewTimeLimitModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-[var(--color-overlay-scrim)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-interview-limit-title"
    >
      <div
        className="rounded-2xl shadow-xl max-w-md w-full p-6 bg-[var(--color-surface)] border border-[var(--color-border-light)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="free-interview-limit-title" className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Your free interview time is up
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm mb-4">
          Complimentary sessions are limited to 15 minutes. Buy credits or upgrade your plan for full-length
          interviews and unlocked feedback. You can end now and open your feedback summary, or go to billing to
          upgrade.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onBuyCredits}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] font-medium disabled:opacity-50 order-2 sm:order-1"
          >
            Buy credits / upgrade
          </button>
          <button
            type="button"
            onClick={onEndAndViewFeedback}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {isEnding ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ending…
              </>
            ) : (
              'End interview & view feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
