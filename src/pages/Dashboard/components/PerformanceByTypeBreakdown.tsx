import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceByType } from '../../../types/dashboard';
import './PerformanceCharts.css';

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  hr: 'HR',
  case_study: 'Case Study',
  communication: 'Communication',
  debate: 'Debate',
};

const CHART_PRIMARY = '#6d28d9';
const CHART_GRID = '#f3f0f7';

interface Props {
  byType: PerformanceByType;
}

export default function PerformanceByTypeBreakdown({ byType }: Props) {
  const data =
    byType != null
      ? Object.entries(byType).map(([key, val]) => ({
          name: TYPE_LABELS[key] || key,
          type: key,
          avg: val?.avg_score ?? 0,
          count: val?.count ?? 0,
        }))
      : [];

  if (!data.length || data.every((d) => d.count === 0)) {
    return (
      <div className="perf-chart">
        <div className="perf-chart__accent" aria-hidden />
        <div className="perf-chart__inner">
          <h3 className="perf-chart__title">Average score by type</h3>
          <div className="perf-chart__empty">
            <p className="perf-chart__empty-title">No breakdown yet</p>
            <p className="perf-chart__empty-text">Your average per interview type will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="perf-chart">
      <div className="perf-chart__accent" aria-hidden />
      <div className="perf-chart__inner">
        <h3 className="perf-chart__title">Average score by type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12, fontWeight: 600 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              fontFamily: 'var(--font-sans)',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name, props: any) => {
              const count = props?.payload?.count ?? 0;
              return [`${value}% avg · ${count} sessions`, 'Score'];
            }}
          />
          <Bar dataKey="avg" fill={CHART_PRIMARY} radius={[0, 6, 6, 0]} name="Average" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

