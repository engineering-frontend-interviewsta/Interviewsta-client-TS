import type { SessionHistoryResponse } from '../../../types/feedback';

interface TechnicalMetaSummaryProps {
  data: SessionHistoryResponse;
}

export default function TechnicalMetaSummary({ data }: TechnicalMetaSummaryProps) {
  const overall = Math.trunc(data.overall_score ?? 0);

  // Soft-skill derived scores (fallback to overall)
  const soft = (data as any).soft_skill_summary as
    | { confidence?: number }
    | undefined;
  const confidence = Math.round(soft?.confidence ?? overall);
  const hiringReadiness = Math.min(overall + 10, 95);
  const technicalReadiness = Math.min(overall + 5, 90);

  // Percentiles from sub_scores if present
  const subScores = (data as any).sub_scores as
    | Record<string, { percentile?: number; total_participants?: number }>
    | undefined;

  const techPercentile = Math.round(
    subScores?.Technical?.percentile ??
      subScores?.['Technical Skills']?.percentile ??
      0
  );
  const psPercentile = Math.round(
    subScores?.['Problem Solving']?.percentile ??
      subScores?.['Problem Solving Skills']?.percentile ??
      0
  );

  const hasAnyMeta =
    overall > 0 ||
    confidence > 0 ||
    hiringReadiness > 0 ||
    technicalReadiness > 0 ||
    techPercentile > 0 ||
    psPercentile > 0;

  if (!hasAnyMeta) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
      <h2 className="text-sm font-medium text-gray-800 mb-4">
        Technical performance summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Metric label="Interview confidence" value={confidence} />
        <Metric label="Hiring readiness" value={hiringReadiness} />
        <Metric label="Technical readiness" value={technicalReadiness} />
      </div>
      {(techPercentile > 0 || psPercentile > 0) && (
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          {techPercentile > 0 && (
            <span>
              Technical skills: top <span className="font-semibold">{techPercentile}%</span>{' '}
              of candidates
            </span>
          )}
          {psPercentile > 0 && (
            <span>
              Problem solving: top{' '}
              <span className="font-semibold">{psPercentile}%</span> of candidates
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface MetricProps {
  label: string;
  value: number;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900">{value}%</p>
    </div>
  );
}

