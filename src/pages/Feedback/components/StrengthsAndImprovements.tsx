import type { InterviewFeedback } from '../../../types/feedback';

interface StrengthsAndImprovementsProps {
  data: InterviewFeedback;
}

export default function StrengthsAndImprovements({ data }: StrengthsAndImprovementsProps) {
  const strengths = Array.from(new Set(data.strengths ?? []));
  const improvements = Array.from(new Set(data.areasForImprovements ?? []));
  if (strengths.length === 0 && improvements.length === 0) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
      {strengths.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Strengths</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            {strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {improvements.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Areas to improve</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            {improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
