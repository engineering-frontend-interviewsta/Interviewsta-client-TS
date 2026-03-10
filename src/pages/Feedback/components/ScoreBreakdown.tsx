import type { SessionHistoryResponse } from '../../../types/feedback';

interface ScoreBreakdownProps {
  data: SessionHistoryResponse;
}

export default function ScoreBreakdown({ data }: ScoreBreakdownProps) {
  const detailed = data.detailed_scores;
  if (!detailed || typeof detailed !== 'object') return null;

  const entries = Object.entries(detailed);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Score breakdown</h2>
      <div className="space-y-4">
        {entries.map(([key, value]) => {
          const score =
            typeof value === 'object' && value !== null && 'score' in value
              ? (value as { score?: number }).score
              : typeof value === 'number'
                ? value
                : null;
          const breakdown =
            typeof value === 'object' && value !== null && 'breakdown' in value
              ? (value as { breakdown?: Record<string, number> }).breakdown
              : undefined;
          const label = key.replace(/_/g, ' ');
          return (
            <div key={key} className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 font-medium capitalize">{label}</span>
                {score != null && (
                  <span className="font-semibold text-gray-900">{score}%</span>
                )}
              </div>
              {breakdown && (
                <ul className="mt-1 space-y-0.5 text-xs text-gray-700">
                  {Object.entries(breakdown).map(([subKey, subScore]) => (
                    <li key={subKey} className="flex justify-between">
                      <span className="text-gray-600">{subKey}</span>
                      <span className="font-medium">{subScore}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
