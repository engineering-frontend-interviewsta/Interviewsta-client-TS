import type { InterviewFeedback } from '../../../types/feedback';

interface TechnicalExtrasProps {
  data: InterviewFeedback;
}

export default function TechnicalExtras({ data }: TechnicalExtrasProps) {
  const log = Array.isArray(data.interactionLogs) ? data.interactionLogs : [];
  const transcriptPreview = log.slice(0, 4);

  if (transcriptPreview.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {transcriptPreview.length > 0 && (
        <div className="md:col-span-2 rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Conversation excerpt</h2>
          <div className="space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
            {transcriptPreview.map((entry, idx) => {
              if (entry.question) {
                return (
                  <p key={idx}>
                    <span className="font-semibold text-gray-900">Interviewer: </span>
                    {entry.question}
                  </p>
                );
              }
              if (entry.answer) {
                return (
                  <p key={idx}>
                    <span className="font-semibold text-gray-900">You: </span>
                    {entry.answer}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
