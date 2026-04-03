import type { InterviewFeedback } from '../../../types/feedback';
import {
  computeSleeveScore,
  formatSleeveLabel,
  normalizeCommunicationMetrics,
  normalizeGrammarMetrics,
  scorePercentTier,
} from '../reportUtils';

interface ScoreBreakdownProps {
  data: InterviewFeedback;
}

function badgeClassForTier(tier: ReturnType<typeof scorePercentTier>): string {
  if (tier === 'high') return 'feedback-report__badge feedback-report__badge--high';
  if (tier === 'mid') return 'feedback-report__badge feedback-report__badge--mid';
  return 'feedback-report__badge feedback-report__badge--low';
}

function fillClassForScore(score: number): string {
  const tier = scorePercentTier(score);
  if (tier === 'high') return 'feedback-report__metric-fill feedback-report__metric-fill--high';
  if (tier === 'mid') return 'feedback-report__metric-fill feedback-report__metric-fill--mid';
  if (tier === 'low') return 'feedback-report__metric-fill feedback-report__metric-fill--low';
  return 'feedback-report__metric-fill feedback-report__metric-fill--concern';
}

export default function ScoreBreakdown({ data }: ScoreBreakdownProps) {
  const items = data.items;
  const communicationMetrics = normalizeCommunicationMetrics(data.communicationMetrics);
  const grammarMetrics = normalizeGrammarMetrics(data.grammarMetrics);
  const hasLanguageMetrics = Boolean(communicationMetrics || grammarMetrics);
  if ((!items || typeof items !== 'object') && !hasLanguageMetrics) return null;

  const entries = items && typeof items === 'object' ? Object.entries(items) : [];
  if (entries.length === 0 && !hasLanguageMetrics) return null;

  return (
    <>
      <header className="feedback-report__section-header">
        <div className="feedback-report__eyebrow feedback-report__mono">01 — Rubric breakdown</div>
        <h2 className="feedback-report__section-title">How each dimension scored</h2>
        <p className="feedback-report__section-desc">
          Each category groups related signals from your session. Bars reflect relative weight
          within the rubric; use them to see where you led versus where to drill next.
        </p>
      </header>

      <div className="feedback-report__card">
        {(communicationMetrics || grammarMetrics) && (
          <>
            <div className="feedback-report__tech-cat">
              <div className="feedback-report__tech-cat-header">
                <div className="feedback-report__tech-cat-title">Language quality metrics</div>
              </div>
              {communicationMetrics && (
                <>
                  <div className="feedback-report__tech-cat-header">
                    <div className="feedback-report__tech-cat-title">Communication</div>
                    <span className={badgeClassForTier(scorePercentTier(Math.round(communicationMetrics.overall)))}>
                      Avg {communicationMetrics.overall.toFixed(1)}%
                    </span>
                  </div>
                  {(
                    [
                      ['Clarity', communicationMetrics.clarity],
                      ['Fluency', communicationMetrics.fluency],
                      ['Response relevance', communicationMetrics.responseRelevance],
                      ['Structure', communicationMetrics.structure],
                    ] as Array<[string, number]>
                  ).map(([label, value]) => (
                    <div key={label} className="feedback-report__metric-row">
                      <span className="feedback-report__metric-name">{label}</span>
                      <div className="feedback-report__metric-bar-wrap">
                        <div className="feedback-report__metric-track">
                          <div
                            className={fillClassForScore(value)}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                      <span className="feedback-report__metric-score">{value}%</span>
                      <span className="feedback-report__metric-note">Computed metric</span>
                    </div>
                  ))}
                </>
              )}
              {grammarMetrics && (
                <>
                  <hr className="feedback-report__divider" />
                  <div className="feedback-report__tech-cat-header">
                    <div className="feedback-report__tech-cat-title">Grammar</div>
                    <span className={badgeClassForTier(scorePercentTier(Math.round(grammarMetrics.overall)))}>
                      Avg {grammarMetrics.overall.toFixed(1)}%
                    </span>
                  </div>
                  {(
                    [
                      ['Grammar correctness', grammarMetrics.grammarCorrectness],
                      ['Sentence construction', grammarMetrics.sentenceConstruction],
                      ['Vocabulary control', grammarMetrics.vocabularyControl],
                      ['Conciseness', grammarMetrics.conciseness],
                    ] as Array<[string, number]>
                  ).map(([label, value]) => (
                    <div key={label} className="feedback-report__metric-row">
                      <span className="feedback-report__metric-name">{label}</span>
                      <div className="feedback-report__metric-bar-wrap">
                        <div className="feedback-report__metric-track">
                          <div
                            className={fillClassForScore(value)}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                      <span className="feedback-report__metric-score">{value}%</span>
                      <span className="feedback-report__metric-note">Computed metric</span>
                    </div>
                  ))}
                </>
              )}
            </div>
            <hr className="feedback-report__divider" />
          </>
        )}
        {entries.map(([key, metrics], catIdx) => {
          const metricsObj = metrics || {};
          const sleeveScore =
            data.sleeveScore != null && key in data.sleeveScore
              ? data.sleeveScore[key]
              : computeSleeveScore(metricsObj);
          const tier = scorePercentTier(Math.round(sleeveScore));
          const subEntries = Object.entries(metricsObj);

          return (
            <div key={key}>
              {catIdx > 0 && <hr className="feedback-report__divider" />}
              <div className="feedback-report__tech-cat">
                <div className="feedback-report__tech-cat-header">
                  <div className="feedback-report__tech-cat-title">
                    {formatSleeveLabel(key)}
                  </div>
                  <span className={badgeClassForTier(tier)}>
                    Avg {sleeveScore.toFixed(1)}%
                  </span>
                </div>
                {subEntries.map(([subKey, subScore]) => {
                  const evaluated = subScore !== -1;
                  const width = evaluated ? Math.min(100, Math.max(0, subScore)) : 0;
                  const display = evaluated ? `${subScore}%` : '—';
                  return (
                    <div key={subKey} className="feedback-report__metric-row">
                      <span className="feedback-report__metric-name">{subKey}</span>
                      <div className="feedback-report__metric-bar-wrap">
                        <div className="feedback-report__metric-track">
                          {evaluated && (
                            <div
                              className={fillClassForScore(subScore)}
                              style={{ width: `${width}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <span className="feedback-report__metric-score">{display}</span>
                      <span className="feedback-report__metric-note">
                        {evaluated ? 'Rubric item' : 'Not evaluated'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
