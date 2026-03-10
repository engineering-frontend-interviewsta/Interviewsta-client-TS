import type { SessionHistoryResponse } from '../../../types/feedback';

interface TechnicalExtrasProps {
  data: SessionHistoryResponse;
}

export default function TechnicalExtras({ data }: TechnicalExtrasProps) {
  const hasSkills = Array.isArray(data.skills_scores) && data.skills_scores.length > 0;
  const speech = data.speech_summary as
    | { grammar?: number; fluency?: number; fillers?: number; clarity?: number }
    | undefined;
  const hasSpeech =
    !!speech &&
    (speech.grammar != null ||
      speech.fluency != null ||
      speech.fillers != null ||
      speech.clarity != null);

  const soft = data.soft_skill_summary;
  const hasAttention =
    !!soft &&
    (soft.gaze != null ||
      soft.nervousness != null ||
      soft.engagement != null ||
      soft.distraction != null);

  const big5 = data.big5_features;
  const hasBig5 =
    !!big5 &&
    (big5.openness != null ||
      big5.conscientiousness != null ||
      big5.extraversion != null ||
      big5.agreeableness != null ||
      big5.neuroticism != null);

  const overallDist = data.allScores;
  const hasOverallDist =
    !!overallDist &&
    (overallDist.percentile != null || overallDist.total_participants != null);

  const log = Array.isArray(data.interaction_log) ? data.interaction_log : [];
  const transcriptPreview = log.slice(0, 4);

  if (
    !hasSkills &&
    !hasSpeech &&
    !hasAttention &&
    !hasBig5 &&
    !hasOverallDist &&
    transcriptPreview.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {hasSkills && (
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Skill scores</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            {data.skills_scores!.map((s) => (
              <li key={s.name} className="flex justify-between">
                <span>{s.name}</span>
                <span className="font-medium">{s.score.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasSpeech && (
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Communication summary</h2>
          <dl className="space-y-1 text-sm text-gray-700">
            {speech?.grammar != null && (
              <div className="flex justify-between">
                <dt>Grammar</dt>
                <dd className="font-medium">{speech.grammar.toFixed(1)}%</dd>
              </div>
            )}
            {speech?.fluency != null && (
              <div className="flex justify-between">
                <dt>Fluency</dt>
                <dd className="font-medium">{speech.fluency.toFixed(1)}%</dd>
              </div>
            )}
            {speech?.fillers != null && (
              <div className="flex justify-between">
                <dt>Fillers</dt>
                <dd className="font-medium">{speech.fillers.toFixed(1)}%</dd>
              </div>
            )}
            {speech?.clarity != null && (
              <div className="flex justify-between">
                <dt>Clarity</dt>
                <dd className="font-medium">{speech.clarity.toFixed(1)}%</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {hasAttention && (
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Attention & behaviour</h2>
          <dl className="space-y-1 text-sm text-gray-700">
            {soft?.gaze != null && (
              <div className="flex justify-between">
                <dt>Gaze</dt>
                <dd className="font-medium">{soft.gaze.toFixed(1)}%</dd>
              </div>
            )}
            {soft?.engagement != null && (
              <div className="flex justify-between">
                <dt>Engagement</dt>
                <dd className="font-medium">{soft.engagement.toFixed(2)}%</dd>
              </div>
            )}
            {soft?.nervousness != null && (
              <div className="flex justify-between">
                <dt>Nervousness</dt>
                <dd className="font-medium">{soft.nervousness.toFixed(2)}%</dd>
              </div>
            )}
            {soft?.distraction != null && (
              <div className="flex justify-between">
                <dt>Distraction</dt>
                <dd className="font-medium">{soft.distraction.toFixed(2)}%</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {hasBig5 && (
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Personality profile (Big 5)</h2>
          <dl className="space-y-1 text-sm text-gray-700">
            {big5?.openness != null && (
              <Row label="Openness" value={big5.openness} />
            )}
            {big5?.conscientiousness != null && (
              <Row label="Conscientiousness" value={big5.conscientiousness} />
            )}
            {big5?.extraversion != null && (
              <Row label="Extraversion" value={big5.extraversion} />
            )}
            {big5?.agreeableness != null && (
              <Row label="Agreeableness" value={big5.agreeableness} />
            )}
            {big5?.neuroticism != null && (
              <Row label="Neuroticism" value={big5.neuroticism} />
            )}
          </dl>
        </div>
      )}

      {hasOverallDist && (
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Overall distribution</h2>
          <p className="text-sm text-gray-700">
            Percentile:{' '}
            <span className="font-medium">
              {overallDist?.percentile != null ? overallDist.percentile.toFixed(1) : '-'}%
            </span>
          </p>
          {overallDist?.total_participants != null && (
            <p className="text-xs text-gray-500 mt-1">
              Based on {overallDist.total_participants} participant
              {overallDist.total_participants === 1 ? '' : 's'}.
            </p>
          )}
        </div>
      )}

      {transcriptPreview.length > 0 && (
        <div className="md:col-span-2 rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Conversation excerpt</h2>
          <div className="space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
            {transcriptPreview.map((entry, idx) => {
              if ('question' in entry && entry.question) {
                return (
                  <p key={idx}>
                    <span className="font-semibold text-gray-900">Interviewer: </span>
                    {entry.question}
                  </p>
                );
              }
              if ('answer' in entry && entry.answer) {
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

interface RowProps {
  label: string;
  value: number;
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-medium">{value.toFixed(1)}%</dd>
    </div>
  );
}


