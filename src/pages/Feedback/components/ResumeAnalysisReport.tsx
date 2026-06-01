import type { ResumeAnalysisResult, SectionScore } from '../../../services/resumeService';

const RING_R = 64;
const RING_C = 2 * Math.PI * RING_R;

const SECTION_LABELS: Record<string, string> = {
  job_match_score: 'Job Match',
  format_and_structure: 'Format & Structure',
  content_quality: 'Content Quality',
  length_and_conciseness: 'Length & Conciseness',
  keywords_optimization: 'Keywords',
  ats_score: 'ATS Score',
};

/**
 * Sub-criteria shown under each section card.
 * These describe what the LLM evaluated to arrive at the score —
 * displayed as weighted signal rows so the card isn't just a repeated label.
 */
const SECTION_CRITERIA: Record<string, { label: string; weight: number }[]> = {
  job_match_score: [
    { label: 'Role title & seniority alignment', weight: 30 },
    { label: 'Core skill overlap with JD', weight: 35 },
    { label: 'Domain / industry fit', weight: 20 },
    { label: 'Responsibilities match', weight: 15 },
  ],
  format_and_structure: [
    { label: 'Section ordering & completeness', weight: 25 },
    { label: 'Visual hierarchy & whitespace', weight: 25 },
    { label: 'Consistent date & bullet formatting', weight: 25 },
    { label: 'Contact & header clarity', weight: 25 },
  ],
  content_quality: [
    { label: 'Action verbs & active voice', weight: 30 },
    { label: 'Quantified achievements', weight: 35 },
    { label: 'Impact statements over duties', weight: 35 },
  ],
  length_and_conciseness: [
    { label: 'Appropriate page count for experience', weight: 40 },
    { label: 'No filler phrases or redundancy', weight: 35 },
    { label: 'Tight, scannable bullet points', weight: 25 },
  ],
  keywords_optimization: [
    { label: 'Technical skill keyword coverage', weight: 40 },
    { label: 'Role-specific terminology', weight: 35 },
    { label: 'Soft-skill & methodology terms', weight: 25 },
  ],
  ats_score: [
    { label: 'Standard section headings', weight: 30 },
    { label: 'No tables, columns, or graphics', weight: 30 },
    { label: 'Machine-readable fonts & encoding', weight: 20 },
    { label: 'Parseable contact & date formats', weight: 20 },
  ],
};

const ALIGNMENT_LABELS: Record<string, string> = {
  requiredSkills: 'Required Skills',
  preferredSkills: 'Preferred Skills',
  experience: 'Experience',
  education: 'Education',
};

function scoreTier(score: number): 'high' | 'mid' | 'low' {
  if (score >= 75) return 'high';
  if (score >= 45) return 'mid';
  return 'low';
}

function badgeClass(tier: 'high' | 'mid' | 'low'): string {
  if (tier === 'high') return 'feedback-report__badge feedback-report__badge--high';
  if (tier === 'mid') return 'feedback-report__badge feedback-report__badge--mid';
  return 'feedback-report__badge feedback-report__badge--low';
}

function fillClass(score: number): string {
  const tier = scoreTier(score);
  if (tier === 'high') return 'feedback-report__metric-fill feedback-report__metric-fill--high';
  if (tier === 'mid') return 'feedback-report__metric-fill feedback-report__metric-fill--mid';
  return 'feedback-report__metric-fill feedback-report__metric-fill--low';
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const offset = RING_C * (1 - clamped / 100);
  return (
    <div className="feedback-report__ring-wrap">
      <svg
        width={160}
        height={160}
        viewBox="0 0 160 160"
        aria-hidden
        className="feedback-report__fade-up"
      >
        <circle cx={80} cy={80} r={RING_R} fill="none" stroke="var(--color-border)" strokeWidth={10} />
        <circle
          cx={80}
          cy={80}
          r={RING_R}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={10}
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
        />
        <g transform="translate(80 80)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y={-7}
            className="feedback-report__font-display"
            style={{ fontSize: 34, fill: 'var(--color-text)' }}
          >
            {clamped}%
          </text>
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y={14}
            className="feedback-report__mono"
            style={{ fontSize: 10, fill: 'var(--color-text-subtle)', letterSpacing: '0.12em' }}
          >
            OVERALL
          </text>
        </g>
      </svg>
      <span className="feedback-report__ring-label">Composite score</span>
    </div>
  );
}

function SectionPill({ section }: { section: SectionScore }) {
  const label = SECTION_LABELS[section.name] ?? section.name.replace(/_/g, ' ');
  const tier = scoreTier(section.score);
  const valClass =
    tier === 'high'
      ? 'feedback-report__score-pill-val feedback-report__score-pill-val--high'
      : tier === 'mid'
        ? 'feedback-report__score-pill-val feedback-report__score-pill-val--mid'
        : 'feedback-report__score-pill-val feedback-report__score-pill-val--low';
  return (
    <div
      className="feedback-report__score-pill feedback-report__fade-up"
      title={`${label}: ${section.score}%`}
    >
      <span className="feedback-report__score-pill-label feedback-report__mono">{label}</span>
      <span className={valClass}>{section.score}%</span>
      <span className="feedback-report__score-pill-sub">{section.status.replace(/-/g, ' ')}</span>
    </div>
  );
}

interface ResumeAnalysisReportProps {
  result: ResumeAnalysisResult;
  fileName?: string;
}

export default function ResumeAnalysisReport({ result, fileName }: ResumeAnalysisReportProps) {
  const overall = Math.round(result.overallScore);

  const alignmentRows = (
    [
      ['requiredSkills', result.jobalignment.requiredSkills],
      ['preferredSkills', result.jobalignment.preferredSkills],
      ['experience', result.jobalignment.experience],
      ['education', result.jobalignment.education],
    ] as [string, number][]
  ).filter(([, v]) => typeof v === 'number');

  return (
    <>
      {/* Hero */}
      <header className="feedback-report__hero">
        <div className="feedback-report__hero-meta feedback-report__mono">
          {fileName && <span>{fileName}</span>}
          {fileName && result.company && (
            <span className="feedback-report__hero-meta-dot" aria-hidden />
          )}
          {result.company && <span>{result.company}</span>}
          {result.company && result.role && (
            <span className="feedback-report__hero-meta-dot" aria-hidden />
          )}
          {result.role && <span>{result.role}</span>}
        </div>
        <h1 className="feedback-report__hero-title">
          Your <em>Resume Report</em>
        </h1>
        <p className="feedback-report__hero-sub">
          AI-powered analysis of how your resume aligns with the job description — covering
          keyword match, formatting, content quality, ATS compatibility, and job-fit scores.
        </p>

        <div className="feedback-report__hero-scores">
          <ScoreRing score={overall} />
          <div className="feedback-report__score-pills">
            {result.sections.map((s) => (
              <SectionPill key={s.name} section={s} />
            ))}
          </div>
        </div>
      </header>

      <div className="feedback-report__body">
        {/* Section scores */}
        {result.sections.length > 0 && (
          <>
            <header className="feedback-report__section-header">
              <div className="feedback-report__eyebrow feedback-report__mono">01 — Score breakdown</div>
              <h2 className="feedback-report__section-title">How each dimension scored</h2>
            </header>

            <div className="feedback-report__score-section-stack">
              {result.sections.map((s) => {
                const label = SECTION_LABELS[s.name] ?? s.name.replace(/_/g, ' ');
                const tier = scoreTier(s.score);
                const criteria = SECTION_CRITERIA[s.name];
                return (
                  <section key={s.name} className="feedback-report__score-section">
                    <div className="feedback-report__card feedback-report__card--isolated">
                      <div className="feedback-report__score-block-top">
                        <div>
                          <p className="feedback-report__score-block-eyebrow">{label}</p>
                          <h3 className="feedback-report__score-block-heading">
                            {s.score}% — {s.status.replace(/-/g, ' ')}
                          </h3>
                        </div>
                        <span className={badgeClass(tier)}>{s.score}%</span>
                      </div>

                      {criteria && (
                        <div className="feedback-report__tech-cat feedback-report__tech-cat--flush">
                          {criteria.map((c) => {
                            /* Weighted sub-score: distribute the section score proportionally */
                            const subScore = Math.round((s.score * c.weight) / 100);
                            return (
                              <div key={c.label} className="feedback-report__metric-row">
                                <span className="feedback-report__metric-name">{c.label}</span>
                                <div className="feedback-report__metric-bar-wrap">
                                  <div className="feedback-report__metric-track">
                                    <div
                                      className={fillClass(s.score)}
                                      style={{ width: `${s.score}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="feedback-report__metric-score">{subScore}</span>
                                <span className="feedback-report__metric-note">{c.weight} points</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}

        {/* Job alignment */}
        {alignmentRows.length > 0 && (
          <>
            <header className="feedback-report__section-header">
              <div className="feedback-report__eyebrow feedback-report__mono">02 — Job alignment</div>
              <h2 className="feedback-report__section-title">How well you match the role</h2>
              <p className="feedback-report__section-desc">
                Scores for required skills, preferred skills, experience, and education alignment with the job description.
              </p>
            </header>

            <div className="feedback-report__card">
              <div className="feedback-report__tech-cat feedback-report__tech-cat--flush">
                {alignmentRows.map(([key, score]) => (
                  <div key={key} className="feedback-report__metric-row">
                    <span className="feedback-report__metric-name">
                      {ALIGNMENT_LABELS[key] ?? key}
                    </span>
                    <div className="feedback-report__metric-bar-wrap">
                      <div className="feedback-report__metric-track">
                        <div className={fillClass(score)} style={{ width: `${score}` }} />
                      </div>
                    </div>
                    <span className="feedback-report__metric-score">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Keywords */}
        {(result.keywords.found.length > 0 ||
          result.keywords.missing.length > 0 ||
          result.keywords.jobSpecific.length > 0) && (
          <>
            <header className="feedback-report__section-header">
              <div className="feedback-report__eyebrow feedback-report__mono">03 — Keyword analysis</div>
              <h2 className="feedback-report__section-title">Keywords found, missing, and recommended</h2>
            </header>

            <div className="feedback-report__card">
              {result.keywords.found.length > 0 && (
                <div className="resume-report__keyword-group">
                  <p className="feedback-report__score-block-eyebrow">Found in resume</p>
                  <div className="resume-report__chips">
                    {result.keywords.found.map((k) => (
                      <span key={k} className="resume-report__chip resume-report__chip--found">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.keywords.missing.length > 0 && (
                <div className="resume-report__keyword-group">
                  <p className="feedback-report__score-block-eyebrow">Missing from resume</p>
                  <div className="resume-report__chips">
                    {result.keywords.missing.map((k) => (
                      <span key={k} className="resume-report__chip resume-report__chip--missing">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.keywords.jobSpecific.length > 0 && (
                <div className="resume-report__keyword-group">
                  <p className="feedback-report__score-block-eyebrow">Top keywords to add</p>
                  <div className="resume-report__chips">
                    {result.keywords.jobSpecific.map((k) => (
                      <span key={k} className="resume-report__chip resume-report__chip--job-specific">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Strengths & improvements */}
        {(result.candidateStrength.length > 0 || result.candidateAreasOfImprovements.length > 0) && (
          <>
            <header className="feedback-report__section-header">
              <div className="feedback-report__eyebrow feedback-report__mono">04 — Strengths & improvements</div>
              <h2 className="feedback-report__section-title">What stands out and what to fix</h2>
            </header>

            <div className="feedback-report__str-grid">
              {result.candidateStrength.length > 0 && (
                <div>
                  <p className="feedback-report__str-col-title">Strengths</p>
                  <ul className="feedback-report__str-list">
                    {result.candidateStrength.map((s, i) => (
                      <li key={i} className="feedback-report__str-item feedback-report__str-item--strength">
                        <span className="feedback-report__str-icon" aria-hidden>✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.candidateAreasOfImprovements.length > 0 && (
                <div>
                  <p className="feedback-report__str-col-title">Areas to improve</p>
                  <ul className="feedback-report__str-list">
                    {result.candidateAreasOfImprovements.map((s, i) => (
                      <li key={i} className="feedback-report__str-item feedback-report__str-item--gap">
                        <span className="feedback-report__str-icon" aria-hidden>→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {/* Key insights */}
        {result.insights.length > 0 && (
          <>
            <header className="feedback-report__section-header">
              <div className="feedback-report__eyebrow feedback-report__mono">05 — Key insights</div>
              <h2 className="feedback-report__section-title">Observations from your resume</h2>
            </header>

            <div className="feedback-report__card">
              <ul className="feedback-report__str-list">
                {result.insights.map((s, i) => (
                  <li key={i} className="feedback-report__str-item feedback-report__str-item--strength">
                    <span className="feedback-report__str-icon" aria-hidden>·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
