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
    };
  }
  return {
    trendStroke: '#0f172a',
    trendGrid: '#e5e7eb',
    trendAxis: '#6b7280',
    barFill: '#6d28d9',
    barGrid: '#f3f0f7',
    barAxis: '#4b5563',
  };
}
