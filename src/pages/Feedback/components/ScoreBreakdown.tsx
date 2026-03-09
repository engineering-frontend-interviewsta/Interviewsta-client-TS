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
      <div className="space-y-3">
        {entries.map(([key, value]) => {
          const score = typeof value === 'object' && value !== null && 'score' in value
            ? (value as { score?: number }).score
            : typeof value === 'number'
              ? value
              : null;
          const label = key.replace(/_/g, ' ');
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 capitalize">{label}</span>
              {score != null && (
                <span className="font-medium text-gray-900">{score}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
