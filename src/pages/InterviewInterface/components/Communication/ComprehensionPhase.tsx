import { useState } from 'react';
import { FileText, Edit3, Send, CheckCircle } from 'lucide-react';

export interface ComprehensionPhaseProps {
  instruction?: string;
  question?: string;
  onSendResponse: (payload: { textResponse: string }) => Promise<void>;
  isProcessing: boolean;
  feedback: string | null;
  onClearFeedback: () => void;
}

export default function ComprehensionPhase({
  instruction,
  question,
  onSendResponse,
  isProcessing,
  feedback,
  onClearFeedback,
}: ComprehensionPhaseProps) {
  const [writtenText, setWrittenText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProceedingToMCQ, setIsProceedingToMCQ] = useState(false);
  const words = writtenText.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const handleSubmit = async () => {
    if (isSubmitting || isProcessing) return;
    if (!writtenText.trim()) {
      return;
    }
    if (wordCount < 50) {
      return;
    }
    if (wordCount > 100) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSendResponse({ textResponse: writtenText });
      onClearFeedback();
      setWrittenText('');
    } catch (err) {
      console.error('Error submitting comprehension:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToMCQ = async () => {
    if (isProceedingToMCQ) return;
    setIsProceedingToMCQ(true);
    try {
      await onSendResponse({ textResponse: 'Yes, I am ready to proceed to the next exercise.' });
    } catch (err) {
      console.error('Error proceeding to MCQ:', err);
      setIsProceedingToMCQ(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Writing Comprehension</h3>
          <p className="text-sm text-gray-600">Write 50-100 words on the given scenario</p>
        </div>
      </div>
      {question && (
        <div className="bg-white rounded-lg p-6 mb-4 border-2 border-orange-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Edit3 className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900">Scenario</h4>
          </div>
          <p className="text-gray-800 leading-relaxed">{question}</p>
        </div>
      )}
      <div className="bg-white rounded-lg p-4 border border-orange-200 mb-4">
        {instruction && (
          <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-gray-700 font-medium text-sm">{instruction}</p>
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
        <textarea
          value={writtenText}
          onChange={(e) => setWrittenText(e.target.value)}
          placeholder="Write your response here (50-100 words)..."
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none text-sm"
          disabled={isSubmitting || isProcessing || !!feedback}
        />
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <span className={`text-xs font-medium ${wordCount < 50 ? 'text-red-500' : wordCount > 100 ? 'text-orange-500' : 'text-green-600'}`}>
            {wordCount} / 50-100 words
          </span>
          {!feedback && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isProcessing || wordCount < 50 || wordCount > 100}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 text-sm"
            >
              <Send className="h-4 w-4" />
              {isSubmitting || isProcessing ? 'Submitting...' : 'Submit Response'}
            </button>
          )}
        </div>
        {(isSubmitting || isProcessing) && !feedback && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm text-orange-600 font-medium">Analyzing your response...</span>
          </div>
        )}
        {feedback && (
          <div className="mt-4 bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h5 className="font-semibold text-green-900">Feedback</h5>
            </div>
            <p className="text-gray-800 leading-relaxed mb-4 text-sm">{feedback}</p>
            <button
              type="button"
              onClick={handleProceedToMCQ}
              disabled={isProceedingToMCQ}
              className="w-full px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProceedingToMCQ ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading MCQ Phase...
                </>
              ) : (
                <>
                  Proceed to MCQ Phase
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
