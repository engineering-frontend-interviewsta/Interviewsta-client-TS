import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ScoreSectionRadarProps {
  /** Metric label and 0–100 score (include real 0); omit not-evaluated (-1) in caller */
  dataPoints: Array<{ name: string; value: number }>;
}

/**
 * Spider / radar view of how sub-metrics compare within one block (single session = profile, not a statistical distribution).
 */
export default function ScoreSectionRadar({ dataPoints }: ScoreSectionRadarProps) {
  const data = dataPoints.filter((d) => typeof d.value === 'number' && d.value >= 0 && d.value <= 100);
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    name: d.name.length > 20 ? `${d.name.slice(0, 18)}…` : d.name,
    value: d.value,
  }));

  return (
    <div className="feedback-report__radar-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#6d28d9"
            fill="#7c3aed"
            fillOpacity={0.22}
            strokeWidth={1.5}
          />
          <Tooltip
            formatter={(value) => {
              const n = typeof value === 'number' ? value : Number(value);
              return Number.isFinite(n) ? [`${Math.round(n)}%`, 'Score'] : ['—', 'Score'];
            }}
            labelFormatter={(label) => label}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid var(--color-border, #e5e7eb)',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
