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
    <>
      <header className="feedback-report__section-header">
        <div className="feedback-report__eyebrow feedback-report__mono">03 — Transcript</div>
        <h2 className="feedback-report__section-title">Conversation excerpt</h2>
        <p className="feedback-report__section-desc">
          A short slice of your dialogue for context alongside the scores above.
        </p>
      </header>

      <div className="feedback-report__card">
        <div className="feedback-report__transcript">
          {transcriptPreview.map((entry, idx) => {
            if (entry.question) {
              return (
                <p key={idx}>
                  <span className="feedback-report__transcript-label">Interviewer: </span>
                  {entry.question}
                </p>
              );
            }
            if (entry.answer) {
              return (
                <p key={idx}>
                  <span className="feedback-report__transcript-label">You: </span>
                  {entry.answer}
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
}
