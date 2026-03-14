import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceTrendPoint } from '../../../types/dashboard';

interface Props {
  trend: PerformanceTrendPoint[] | undefined;
  title?: string;
  height?: number;
}

export default function PerformanceTrendChart({ trend, title = 'Overall performance trend', height = 280 }: Props) {
  if (!trend || trend.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500" style={{ height }}>
        <p className="text-gray-500 font-medium">No trend data yet</p>
        <p className="text-gray-400 text-sm mt-1">Complete more interviews to see your performance over time.</p>
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
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="index"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tickValue: number) => chartData[tickValue]?.dateLabel ?? ''}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value}%`, 'Score']}
            labelFormatter={(_, payload) => {
              const d = payload[0]?.payload?.fullDate;
              return d && !Number.isNaN(new Date(d).getTime())
                ? new Date(d).toLocaleDateString()
                : payload[0]?.payload?.dateLabel ?? '';
            }}
            cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

