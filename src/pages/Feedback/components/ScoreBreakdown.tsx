import type { InterviewFeedback } from '../../../types/feedback';

interface ScoreBreakdownProps {
  data: InterviewFeedback;
}

function computeSleeveScore(metrics: Record<string, number>): number {
  const valid = Object.values(metrics).filter((v) => v !== -1);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return sum / valid.length;
}

export default function ScoreBreakdown({ data }: ScoreBreakdownProps) {
  const items = data.items;
  if (!items || typeof items !== 'object') return null;

  const entries = Object.entries(items);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Score breakdown</h2>
      <div className="space-y-4">
        {entries.map(([key, metrics]) => {
          const metricsObj = metrics || {};
          const sleeveScore =
            data.sleeveScore != null && key in data.sleeveScore
              ? data.sleeveScore[key]
              : computeSleeveScore(metricsObj);
          const label = key.replace(/_/g, ' ');
          return (
            <div key={key} className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 font-medium capitalize">{label}</span>
                <span className="font-semibold text-gray-900">
                  {sleeveScore.toFixed(1)}%
                </span>
              </div>
              <ul className="mt-1 space-y-0.5 text-xs text-gray-700">
                {Object.entries(metricsObj).map(([subKey, subScore]) => (
                  <li key={subKey} className="flex justify-between">
                    <span className="text-gray-600">{subKey}</span>
                    <span className="font-medium">
                      {subScore === -1 ? 'Not evaluated' : `${subScore}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
