import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Send } from 'lucide-react';

export interface MCQPhaseProps {
  instruction?: string;
  question?: string;
  options?: string[];
  questionNumber: number;
  totalQuestions: number;
  onSendResponse: (payload: { textResponse: string }) => Promise<void>;
  onMCQSubmit: () => void;
  feedback: string | null;
  onClearFeedback: () => void;
}

export default function MCQPhase({
  instruction,
  question,
  options = [],
  questionNumber,
  totalQuestions,
  onSendResponse,
  onMCQSubmit,
  feedback,
  onClearFeedback,
}: MCQPhaseProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitting(false);
    onClearFeedback();
  }, [question]);

  const handleSubmit = async () => {
    if (selectedOption === null) {
      return;
    }
    const optionText = options[selectedOption] ?? '';
    setIsSubmitting(true);
    try {
      await onSendResponse({ textResponse: optionText });
      onMCQSubmit();
    } catch (err) {
      console.error('Error submitting MCQ:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-[var(--color-primary-muted)]/50 bg-[var(--color-surface-alt)] p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">Vocabulary Test</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Question {questionNumber} of {totalQuestions}</p>
          </div>
        </div>
      </div>
      {instruction && (
        <div className="bg-[var(--color-surface)] rounded-lg p-4 mb-4 border border-[var(--color-primary-muted)]/35">
          <p className="text-[var(--color-text)] font-medium text-sm">{instruction}</p>
        </div>
      )}
      {question && (
        <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-4 border-2 border-[var(--color-primary-muted)]/45 shadow-sm">
          <h4 className="font-semibold text-[var(--color-text)] mb-4 text-lg">{question}</h4>
          {options.length > 0 && (
            <div className="space-y-3">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedOption(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedOption === index
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md'
                      : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-primary-muted)]/50 hover:bg-[var(--color-primary-light)]'
                  }`}
                >
                  {selectedOption === index ? (
                    <CheckCircle className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-[var(--color-text-subtle)] flex-shrink-0" />
                  )}
                  <span className="font-medium text-[var(--color-text)]">{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!feedback && (
        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-primary-muted)]/35 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[var(--color-text-muted)]">
            {isSubmitting ? 'Processing your answer...' : 'Select your answer above and click submit.'}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedOption === null || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 text-sm"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Answer
              </>
            )}
          </button>
        </div>
      )}
      {feedback && (
        <div className="bg-[var(--color-success-bg)] rounded-lg p-4 border-2 border-[var(--color-success-border)]">
          <h4 className="font-semibold text-[var(--color-success-text)] mb-1">Feedback</h4>
          <p className="text-[var(--color-text)] whitespace-pre-wrap text-sm">{feedback}</p>
        </div>
      )}
    </div>
  );
}
