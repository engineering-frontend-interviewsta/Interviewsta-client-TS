import type { InterviewFeedback } from '../../../types/feedback';

interface TechnicalMetaSummaryProps {
  data: InterviewFeedback;
}

export default function TechnicalMetaSummary({ data }: TechnicalMetaSummaryProps) {
  const baseOverall = data.overallScore ?? 0;
  const overall = baseOverall < 0 ? 0 : Math.trunc(baseOverall);

  // Simple derived meta scores from overall
  const confidence = Math.round(overall);
  const hiringReadiness = Math.min(overall + 10, 95);
  const technicalReadiness = Math.min(overall + 5, 90);

  const hasAnyMeta =
    overall > 0 ||
    confidence > 0 ||
    hiringReadiness > 0 ||
    technicalReadiness > 0;

  if (!hasAnyMeta) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
      <h2 className="text-sm font-medium text-gray-800 mb-4">
        Technical performance summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
        <Metric label="Interview confidence" value={confidence} />
        <Metric label="Hiring readiness" value={hiringReadiness} />
        <Metric label="Technical readiness" value={technicalReadiness} />
      </div>
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

