export interface EndInterviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEnding: boolean;
  /** When true, show "Preparing your feedback..." and keep modal open until redirect */
  isPreparingFeedback?: boolean;
}

export default function EndInterviewModal({
  open,
  onClose,
  onConfirm,
  isEnding,
  isPreparingFeedback = false,
}: EndInterviewModalProps) {
  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (isPreparingFeedback || isEnding) return;
    onClose();
  };

  if (isPreparingFeedback) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-[var(--color-overlay-scrim)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-interview-title"
        onClick={handleBackdrop}
      >
        <div
          className="rounded-2xl shadow-xl max-w-md w-full p-6 text-center bg-[var(--color-surface)] border border-[var(--color-border-light)]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="end-interview-title" className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Preparing your feedback
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            You&apos;ll be redirected to the feedback page shortly.
          </p>
          <div className="flex justify-center">
            <span className="inline-block w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-[var(--color-overlay-scrim)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-interview-title"
      onClick={handleBackdrop}
    >
      <div
        className="rounded-2xl shadow-xl max-w-md w-full p-6 bg-[var(--color-surface)] border border-[var(--color-border-light)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="end-interview-title" className="text-lg font-semibold text-[var(--color-text)] mb-2">
          End this interview?
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Your session will end and your progress will be saved. You&apos;ll go to the feedback page. This
          cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {isEnding ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ending…
              </>
            ) : (
              'Yes, end interview'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
