import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { InterviewFeedback } from '../../../types/feedback';

interface StrengthsAndImprovementsProps {
  data: InterviewFeedback;
}

export default function StrengthsAndImprovements({ data }: StrengthsAndImprovementsProps) {
  const strengths = Array.from(new Set(data.strengths ?? []));
  const improvements = Array.from(new Set(data.areasForImprovements ?? []));
  if (strengths.length === 0 && improvements.length === 0) return null;

  return (
    <>
      <header className="feedback-report__section-header">
        <div className="feedback-report__eyebrow feedback-report__mono">02 — Summary</div>
        <h2 className="feedback-report__section-title">Strengths &amp; growth areas</h2>
        <p className="feedback-report__section-desc">
          Highlights what came through strongly in your session and where a bit more polish
          would move the needle in a real loop.
        </p>
      </header>

      <div className="feedback-report__card">
        <div className="feedback-report__str-grid">
          <div>
            <h3 className="feedback-report__str-col-title">Strengths</h3>
            {strengths.length === 0 ? (
              <p className="feedback-report__section-desc" style={{ marginTop: 0 }}>
                No strengths listed for this session.
              </p>
            ) : (
              <ul className="feedback-report__str-list">
                {strengths.map((s, i) => (
                  <li key={i} className="feedback-report__str-item feedback-report__str-item--strength">
                    <CheckCircle2 className="feedback-report__str-icon" size={18} aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="feedback-report__str-col-title">Areas to improve</h3>
            {improvements.length === 0 ? (
              <p className="feedback-report__section-desc" style={{ marginTop: 0 }}>
                No improvement notes for this session.
              </p>
            ) : (
              <ul className="feedback-report__str-list">
                {improvements.map((s, i) => (
                  <li key={i} className="feedback-report__str-item feedback-report__str-item--gap">
                    <AlertCircle className="feedback-report__str-icon" size={18} aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
