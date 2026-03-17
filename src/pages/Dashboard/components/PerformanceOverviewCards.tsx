import { Code2, Users, Briefcase, MessageCircle, MessageSquare } from 'lucide-react';
import type { PerformanceByType, PerformanceOverall } from '../../../types/dashboard';
import './PerformanceOverviewCards.css';

const TYPE_ICONS = {
  technical: Code2,
  hr: Users,
  case_study: Briefcase,
  communication: MessageCircle,
  debate: MessageSquare,
} as const;

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
    <div className="perf-overview">
      <div className="perf-overview__hero">
        <h3 className="perf-overview__hero-title">Overall performance</h3>
        <p className="perf-overview__hero-subtitle">Across all interview types</p>
        <p className="perf-overview__hero-value">{overallAvg}%</p>
        <p className="perf-overview__hero-meta">{totalSessions} total sessions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {TYPE_CONFIG.map((config) => {
          const data = byType?.[config.key] ?? { count: 0, avg_score: 0 };
          const Icon = TYPE_ICONS[config.key];
          return (
            <div
              key={String(config.key)}
              className="border border-gray-200 rounded-lg p-4 text-sm flex flex-col justify-between"
            >
              <div>
                <span className="perf-overview__type-icon" aria-hidden>
                  {Icon && <Icon size={20} strokeWidth={2} />}
                </span>
                <h4 className="perf-overview__type-label">{config.label}</h4>
                <p className="perf-overview__type-sublabel">{config.sublabel}</p>
              </div>
              <div className="perf-overview__type-row">
                <span className="perf-overview__type-value">{data.avg_score}%</span>
                <span className="perf-overview__type-meta">{data.count} sessions</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
