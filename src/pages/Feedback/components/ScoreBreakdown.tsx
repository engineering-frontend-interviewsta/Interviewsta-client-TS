import type { InterviewFeedback } from '../../../types/feedback';
import ScoreSectionRadar from './ScoreSectionRadar';
import {
  CODE_QUALITY_SLEEVE_KEY,
  computeSleeveScoreForDisplay,
  filterCodeQualityMetricsForDisplay,
  formatSleeveTitleForDisplay,
  isRubricEvaluated,
  normalizeCommunicationMetrics,
  normalizeGrammarMetrics,
  orderTechnicalItemsEntries,
  PROBLEM_SOLVING_SLEEVE_KEY,
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

function sectionIntroForSleeve(sleeveKey: string): string {
  if (sleeveKey === PROBLEM_SOLVING_SLEEVE_KEY) {
    return 'How you clarified requirements, chose approaches, and handled constraints and edge cases.';
  }
  if (sleeveKey === CODE_QUALITY_SLEEVE_KEY) {
    return 'Readability, structure, and correctness of the code you wrote.';
  }
  return 'Signals grouped for this interview type. 0% means the rubric scored that area at zero (still evaluated). “Not evaluated” means that area was not exercised or had no evidence (−1 in the rubric).';
}

export default function ScoreBreakdown({ data }: ScoreBreakdownProps) {
  const items = data.items;
  const communicationMetrics = normalizeCommunicationMetrics(data.communicationMetrics);
  const grammarMetrics = normalizeGrammarMetrics(data.grammarMetrics);
  const hasLanguageMetrics = Boolean(communicationMetrics || grammarMetrics);
  if ((!items || typeof items !== 'object') && !hasLanguageMetrics) return null;

  const entries =
    items && typeof items === 'object'
      ? (Object.entries(items) as [string, Record<string, number>][])
      : [];
  if (entries.length === 0 && !hasLanguageMetrics) return null;

  const orderedTechnical = orderTechnicalItemsEntries(entries);

  return (
    <>
      <header className="feedback-report__section-header">
        <div className="feedback-report__eyebrow feedback-report__mono">01 — Score breakdown</div>
        <h2 className="feedback-report__section-title">How each dimension scored</h2>
        <p className="feedback-report__section-desc">
          Each block below uses wording matched to that part of the interview. You will see 0% where
          the rubric scored an area at zero (evaluated). “Not evaluated” is only for areas with no
          score for this session.
        </p>
      </header>

      <div className="feedback-report__score-section-stack">
        {communicationMetrics && (
          <section className="feedback-report__score-section" aria-labelledby="score-comm-heading">
            <div className="feedback-report__card feedback-report__card--isolated">
              <div className="feedback-report__score-block-top">
                <h3 id="score-comm-heading" className="feedback-report__score-block-heading">
                  Communication
                </h3>
                <span
                  className={badgeClassForTier(
                    scorePercentTier(Math.round(communicationMetrics.overall)),
                  )}
                >
                  Avg {communicationMetrics.overall.toFixed(1)}%
                </span>
              </div>
              <p className="feedback-report__score-block-lead">
                Clarity, fluency, how well your answers matched the questions, and how structured your
                explanations were — from your spoken and written responses.
              </p>
              <ScoreSectionRadar
                dataPoints={(
                  [
                    ['Clarity', communicationMetrics.clarity],
                    ['Fluency', communicationMetrics.fluency],
                    ['Relevance', communicationMetrics.responseRelevance],
                    ['Structure', communicationMetrics.structure],
                  ] as const
                ).map(([name, value]) => ({ name, value: value as number }))}
              />
              <div className="feedback-report__tech-cat feedback-report__tech-cat--flush">
                {(
                  [
                    ['Clarity', communicationMetrics.clarity],
                    ['Fluency', communicationMetrics.fluency],
                    ['Response relevance', communicationMetrics.responseRelevance],
                    ['Structure', communicationMetrics.structure],
                  ] as Array<[string, number]>
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className={`feedback-report__metric-row${value === 0 ? ' feedback-report__metric-row--zero' : ''}`}
                  >
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
                    <span className="feedback-report__metric-note">
                      {value === 0 ? 'Scored (0%)' : 'Scored'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {grammarMetrics && (
          <section className="feedback-report__score-section" aria-labelledby="score-grammar-heading">
            <div className="feedback-report__card feedback-report__card--isolated">
              <div className="feedback-report__score-block-top">
                <h3 id="score-grammar-heading" className="feedback-report__score-block-heading">
                  Grammar
                </h3>
                <span
                  className={badgeClassForTier(scorePercentTier(Math.round(grammarMetrics.overall)))}
                >
                  Avg {grammarMetrics.overall.toFixed(1)}%
                </span>
              </div>
              <p className="feedback-report__score-block-lead">
                Grammar accuracy, sentence construction, vocabulary fit, and conciseness — inferred from
                what you said or wrote during the interview.
              </p>
              <ScoreSectionRadar
                dataPoints={(
                  [
                    ['Grammar', grammarMetrics.grammarCorrectness],
                    ['Sentences', grammarMetrics.sentenceConstruction],
                    ['Vocabulary', grammarMetrics.vocabularyControl],
                    ['Concise', grammarMetrics.conciseness],
                  ] as const
                ).map(([name, value]) => ({ name, value: value as number }))}
              />
              <div className="feedback-report__tech-cat feedback-report__tech-cat--flush">
                {(
                  [
                    ['Grammar correctness', grammarMetrics.grammarCorrectness],
                    ['Sentence construction', grammarMetrics.sentenceConstruction],
                    ['Vocabulary control', grammarMetrics.vocabularyControl],
                    ['Conciseness', grammarMetrics.conciseness],
                  ] as Array<[string, number]>
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className={`feedback-report__metric-row${value === 0 ? ' feedback-report__metric-row--zero' : ''}`}
                  >
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
                    <span className="feedback-report__metric-note">
                      {value === 0 ? 'Scored (0%)' : 'Scored'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {orderedTechnical.map(([key, metricsObj]) => {
          const metricsRaw = metricsObj || {};
          const displayMetrics =
            key === CODE_QUALITY_SLEEVE_KEY
              ? filterCodeQualityMetricsForDisplay(metricsRaw)
              : metricsRaw;
          const sleeveScore = computeSleeveScoreForDisplay(key, metricsRaw);
          const tier = scorePercentTier(Math.round(sleeveScore));
          const subEntries = Object.entries(displayMetrics);
          const radarEvaluatedPoints = subEntries.filter(([, subScore]) => isRubricEvaluated(subScore));
          const title = formatSleeveTitleForDisplay(key);
          const slug = key.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

          return (
            <section
              key={key}
              className="feedback-report__score-section"
              aria-labelledby={`score-tech-${slug}-heading`}
            >
              <div className="feedback-report__card feedback-report__card--isolated">
                <div className="feedback-report__score-block-top">
                  <h3 id={`score-tech-${slug}-heading`} className="feedback-report__score-block-heading">
                    {title}
                  </h3>
                  <span className={badgeClassForTier(tier)}>Avg {sleeveScore.toFixed(1)}%</span>
                </div>
                <p className="feedback-report__score-block-lead">{sectionIntroForSleeve(key)}</p>
                {radarEvaluatedPoints.length >= 2 ? (
                  <ScoreSectionRadar
                    dataPoints={radarEvaluatedPoints.map(([subKey, subScore]) => ({
                      name: subKey,
                      value: Math.min(100, Math.max(0, subScore)),
                    }))}
                  />
                ) : subEntries.length === 0 && key === CODE_QUALITY_SLEEVE_KEY ? (
                  <p className="feedback-report__score-block-lead feedback-report__score-block-lead--tight">
                    No code-quality sub-scores in this rubric view (e.g. only verbal communication,
                    which is summarized under Language quality when present).
                  </p>
                ) : null}
                <div className="feedback-report__tech-cat feedback-report__tech-cat--flush">
                  {subEntries.map(([subKey, subScore]) => {
                    const evaluated = isRubricEvaluated(subScore);
                    const width = evaluated ? Math.min(100, Math.max(0, subScore)) : 0;
                    const display = evaluated ? `${subScore}%` : '—';
                    return (
                      <div
                        key={subKey}
                        className={`feedback-report__metric-row${evaluated && subScore === 0 ? ' feedback-report__metric-row--zero' : ''}`}
                      >
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
                          {evaluated ? (subScore === 0 ? 'Scored (0%)' : 'Scored') : 'Not evaluated'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

