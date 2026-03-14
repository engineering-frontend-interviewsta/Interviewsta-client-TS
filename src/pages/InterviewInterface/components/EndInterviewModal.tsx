
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

  if (isPreparingFeedback) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-interview-title"
      >
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
          <h2 id="end-interview-title" className="text-lg font-semibold text-slate-900 mb-2">
            Preparing your feedback
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            You&apos;ll be redirected to the feedback page shortly.
          </p>
          <div className="flex justify-center">
            <span className="inline-block w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-interview-title"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2
          id="end-interview-title"
          className="text-lg font-semibold text-slate-900 mb-2"
        >
          End interview?
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Your progress will be saved and you&apos;ll be redirected to the feedback page.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isEnding ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ending…
              </>
            ) : (
              'End Interview'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
