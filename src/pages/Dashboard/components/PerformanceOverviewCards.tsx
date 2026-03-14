import type { PerformanceByType, PerformanceOverall } from '../../../types/dashboard';

const TYPE_CONFIG: { key: keyof PerformanceByType; label: string; sublabel: string }[] = [
  { key: 'technical', label: 'Technical', sublabel: 'Coding / System design' },
  { key: 'behavioral', label: 'Behavioral', sublabel: 'HR & fit' },
  { key: 'role-based', label: 'Role-based', sublabel: 'Job-specific' },
  { key: 'case-study', label: 'Case Study', sublabel: 'Analytical & business' },
  { key: 'debate', label: 'Debate', sublabel: 'Argumentation' },
  { key: 'specialised', label: 'Specialised', sublabel: 'Niche topics' },
  { key: 'miscellaneous', label: 'Miscellaneous', sublabel: 'Other' },
];

interface Props {
  byType: PerformanceByType;
  overall: PerformanceOverall;
}

export default function PerformanceOverviewCards({ byType, overall }: Props) {
  const totalSessions = overall?.total_sessions ?? 0;
  const overallAvg = overall?.overall_avg ?? 0;

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-1">Overall performance</h3>
        <p className="text-sm text-gray-600 mb-2">Across all interview types</p>
        <p className="text-2xl font-bold text-gray-900">{overallAvg}%</p>
        <p className="text-xs text-gray-500 mt-1">{totalSessions} total sessions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {TYPE_CONFIG.map((config) => {
          const data = byType?.[config.key] ?? { count: 0, avg_score: 0 };
          return (
            <div
              key={String(config.key)}
              className="border border-gray-200 rounded-lg p-4 text-sm flex flex-col justify-between"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{config.label}</h4>
                <p className="text-xs text-gray-500">{config.sublabel}</p>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-bold text-gray-900">{data.avg_score}%</span>
                <span className="text-xs text-gray-600">{data.count} sessions</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
