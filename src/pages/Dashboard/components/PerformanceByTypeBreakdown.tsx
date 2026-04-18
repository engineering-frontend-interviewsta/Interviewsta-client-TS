import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceResponse } from '../../../types/dashboard';
import { useTheme } from '../../../context/ThemeContext';
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  getDashboardChartPalette,
} from '../chartTheme';

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'role-based': 'Role-based',
  'case-study': 'Case Study',
  debate: 'Debate',
  specialised: 'Specialised',
  miscellaneous: 'Miscellaneous',
};

interface Props {
  /** Data from the performance endpoint (average score per interview type) */
  performance: PerformanceResponse | null;
}

export default function PerformanceByTypeBreakdown({ performance }: Props) {
  const { resolvedTheme } = useTheme();
  const chart = getDashboardChartPalette(resolvedTheme);

  const data =
    performance != null
      ? Object.entries(performance).map(([key, val]) => ({
          name: TYPE_LABELS[key] || key,
          type: key,
          avg: val?.averageScore ?? 0,
          count: val?.totalSessions ?? 0,
        }))
      : [];

  if (!data.length) {
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
          <CartesianGrid strokeDasharray="3 3" stroke={chart.barGrid} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: chart.barAxis }} />
          <YAxis
            type="category"
            dataKey="name"
            width={75}
            tick={{ fontSize: 12, fontWeight: 600, fill: chart.barAxis }}
          />
          <Tooltip
            contentStyle={chartTooltipContentStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name, props: any) => {
              const count = props?.payload?.count ?? 0;
              return [`${value}% avg · ${count} sessions`, 'Score'];
            }}
          />
          <Bar dataKey="avg" fill={chart.barFill} radius={[0, 6, 6, 0]} name="Average" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
