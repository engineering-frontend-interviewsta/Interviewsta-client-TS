import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceByType } from '../../../types/dashboard';

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  hr: 'HR',
  case_study: 'Case Study',
  communication: 'Communication',
  debate: 'Debate',
};

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
      <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
        <p className="text-gray-500 font-medium">No breakdown yet</p>
        <p className="text-gray-400 text-sm mt-1">Your average per interview type will appear here.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Average score by type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12, fontWeight: 600 }} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name, props: any) => {
              const count = props?.payload?.count ?? 0;
              return [`${value}% avg · ${count} sessions`, 'Score'];
            }}
          />
          <Bar dataKey="avg" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Average" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

