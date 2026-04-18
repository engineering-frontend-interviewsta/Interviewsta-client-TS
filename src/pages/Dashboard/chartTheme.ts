import type { CSSProperties } from 'react';

/** Tooltip panel: uses CSS variables so it tracks ThemeContext without inline palette sync. */
export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border-light)',
  boxShadow: 'var(--shadow-md)',
  fontFamily: 'var(--font-sans)',
};

export const chartTooltipLabelStyle: CSSProperties = { color: 'var(--color-text-muted)' };
export const chartTooltipItemStyle: CSSProperties = { color: 'var(--color-text)' };

/** Recharts colors aligned with `index.css` light / dark tokens. */
export function getDashboardChartPalette(resolved: 'light' | 'dark') {
  if (resolved === 'dark') {
    return {
      trendStroke: '#e2e8f0',
      trendGrid: '#2d2640',
      trendAxis: '#94a3b8',
      barFill: '#a78bfa',
      barGrid: '#2d2640',
      barAxis: '#94a3b8',
      histogramFill: '#e2e8f0',
      radarStroke: '#a78bfa',
      radarFill: '#a78bfa',
      pieColors: ['#a78bfa', '#e2e8f0', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#c084fc'],
    };
  }
  return {
    trendStroke: '#0f172a',
    trendGrid: '#e5e7eb',
    trendAxis: '#6b7280',
    barFill: '#6d28d9',
    barGrid: '#f3f0f7',
    barAxis: '#4b5563',
    histogramFill: '#0f172a',
    radarStroke: '#6d28d9',
    radarFill: '#6d28d9',
    pieColors: ['#6d28d9', '#0f172a', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'],
  };
}
