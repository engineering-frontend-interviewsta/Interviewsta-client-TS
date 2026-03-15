import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceTrendPoint } from '../../../types/dashboard';
import './PerformanceCharts.css';

interface Props {
  trend: PerformanceTrendPoint[] | undefined;
  title?: string;
  height?: number;
}

/* Hex for Recharts SVG (theme primary #6d28d9) */
const CHART_PRIMARY = '#6d28d9';
const CHART_GRID = '#f3f0f7';
const CHART_AXIS = '#5c5466';

export default function PerformanceTrendChart({ trend, title = 'Overall performance trend', height = 280 }: Props) {
  if (!trend || trend.length === 0) {
    return (
      <div className="perf-chart" style={{ minHeight: height + 60 }}>
        <div className="perf-chart__accent" aria-hidden />
        <div className="perf-chart__inner">
          <h3 className="perf-chart__title">{title}</h3>
          <div className="perf-chart__empty">
            <p className="perf-chart__empty-title">No trend data yet</p>
            <p className="perf-chart__empty-text">Complete more interviews to see your performance over time.</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = trend.map(({ date, score }, index) => ({
    index,
    dateLabel: date
      ? new Date(date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        })
      : '',
    score: Number(score),
    fullDate: date,
  }));

  return (
    <div className="perf-chart">
      <div className="perf-chart__accent" aria-hidden />
      <div className="perf-chart__inner">
        <h3 className="perf-chart__title">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="index"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tickValue: number) => chartData[tickValue]?.dateLabel ?? ''}
            tick={{ fontSize: 11, fill: CHART_AXIS }}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_AXIS }} />
          <Tooltip
            contentStyle={{
              borderRadius: 'var(--radius-lg)',
              border: `1px solid var(--color-border-light)`,
              fontFamily: 'var(--font-sans)',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value}%`, 'Score']}
            labelFormatter={(_, payload) =>
              payload[0]?.payload?.fullDate ? new Date(payload[0].payload.fullDate).toLocaleDateString() : ''
            }
            cursor={{ stroke: CHART_PRIMARY, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={CHART_PRIMARY}
            strokeWidth={2}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

