import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceTrendPoint } from '../../../types/dashboard';
import { useTheme } from '../../../context/ThemeContext';
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  getDashboardChartPalette,
} from '../chartTheme';
import './PerformanceCharts.css';

interface Props {
  trend: PerformanceTrendPoint[] | undefined;
  title?: string;
  height?: number;
}

export default function PerformanceTrendChart({ trend, title = 'Overall performance trend', height = 280 }: Props) {
  const { resolvedTheme } = useTheme();
  const chart = getDashboardChartPalette(resolvedTheme);
  const gradientId = `trendGradient-${resolvedTheme}`;

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

  const chartData = trend.map(({ date, score }, index) => {
    const isValidDate = date && !Number.isNaN(new Date(date).getTime());
    const dateLabel = isValidDate
      ? new Date(date!).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        })
      : index === 0
        ? 'Prev week'
        : 'This week';
    return {
      index,
      dateLabel,
      score: Number(score),
      fullDate: date,
    };
  });

  return (
    <div className="perf-chart">
      <div className="perf-chart__accent" aria-hidden />
      <div className="perf-chart__inner">
        <h3 className="perf-chart__title">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chart.trendStroke} stopOpacity={0.45} />
              <stop offset="100%" stopColor={chart.trendStroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.trendGrid} />
          <XAxis
            dataKey="index"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tickValue: number) => chartData[tickValue]?.dateLabel ?? ''}
            tick={{ fontSize: 11, fill: chart.trendAxis }}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chart.trendAxis }} />
          <Tooltip
            contentStyle={chartTooltipContentStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value}%`, 'Score']}
            labelFormatter={(_, payload) => {
              const d = payload[0]?.payload?.fullDate;
              return d && !Number.isNaN(new Date(d).getTime())
                ? new Date(d).toLocaleDateString()
                : payload[0]?.payload?.dateLabel ?? '';
            }}
            cursor={{ stroke: chart.trendAxis, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={chart.trendStroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

