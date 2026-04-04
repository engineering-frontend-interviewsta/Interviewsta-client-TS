import type { InterviewFeedback } from '../../../types/feedback';

interface TechnicalExtrasProps {
  data: InterviewFeedback;
}

export default function TechnicalExtras({ data }: TechnicalExtrasProps) {
  const log = Array.isArray(data.interactionLogs) ? data.interactionLogs : [];

  if (log.length === 0) {
    return null;
  }

  return (
    <>
      <header className="feedback-report__section-header">
        <div className="feedback-report__eyebrow feedback-report__mono">03 — Transcript</div>
        <h2 className="feedback-report__section-title">Interview transcript</h2>
        <p className="feedback-report__section-desc">
          Full dialogue from this session (interviewer prompts and your responses), in order.
        </p>
      </header>

      <div className="feedback-report__card">
        <div className="feedback-report__transcript">
          {log.map((entry, idx) => {
            if (entry.question) {
              return (
                <p key={`q-${idx}-${entry.timestamp ?? ''}`}>
                  <span className="feedback-report__transcript-label">Interviewer: </span>
                  {entry.question}
                </p>
              );
            }
            if (entry.answer) {
              return (
                <p key={`a-${idx}-${entry.timestamp ?? ''}`}>
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
