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
  { key: 'technical', label: 'Technical', sublabel: 'Coding / Company / Subject' },
  { key: 'hr', label: 'HR', sublabel: 'Behavioral & fit' },
  { key: 'case_study', label: 'Case Study', sublabel: 'Analytical & business' },
  { key: 'communication', label: 'Communication', sublabel: 'Speaking & comprehension' },
  { key: 'debate', label: 'Debate', sublabel: 'Argumentation & persuasion' },
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
      <div className="perf-overview__grid">
        {TYPE_CONFIG.map((config, index) => {
          const data = byType?.[config.key] ?? { count: 0, avg_score: 0 };
          const Icon = TYPE_ICONS[config.key];
          return (
            <div
              key={config.key as string}
              className="perf-overview__type-card"
              style={{ animationDelay: `${index * 50}ms` }}
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

