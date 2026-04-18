import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  chartTooltipContentStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  getDashboardChartPalette,
} from '../../Dashboard/chartTheme';
import {
  getTeacherStudentAnalytics,
  getTeacherStudentDetail,
  type TeacherStudentAnalyticsResponse,
} from '../../../services/b2bService';
import '../../B2B/B2B.css';
import '../../Dashboard/components/PerformanceCharts.css';
import './TeacherStudentDetail.css';

type TeacherStudentDetailResponse = {
  student: { studentUserId: string; name: string; email: string };
  summary: { classCount: number; feedbackCount: number; averageScore: number };
  classes: Array<{ classId: string; name: string; code: string }>;
  recentFeedbacks: Array<{
    feedbackId: string;
    overallScore: number;
    savedAt: string;
    interviewTitle: string;
  }>;
};

export default function TeacherStudentDetailPage() {
  const { roles } = useAuth();
  const { resolvedTheme } = useTheme();
  const chart = useMemo(() => getDashboardChartPalette(resolvedTheme), [resolvedTheme]);
  const trendGradId = `tsdTrend-${resolvedTheme}`;
  const typeTrendGradId = `tsdTypeTrend-${resolvedTheme}`;
  const { studentUserId = '' } = useParams();
  const [data, setData] = useState<TeacherStudentDetailResponse | null>(null);
  const [analytics, setAnalytics] = useState<TeacherStudentAnalyticsResponse | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<StudentTab>('overview');

  useEffect(() => {
    (async () => {
      try {
        const response = await getTeacherStudentDetail(studentUserId);
        setData(response.data as TeacherStudentDetailResponse);
        const a = await getTeacherStudentAnalytics(studentUserId);
        setAnalytics(a.data);
      } catch {
        setError('Unable to load student detail');
      }
    })();
  }, [studentUserId]);

  if (!roles?.includes('teacher')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  const byTypeData = useMemo(() => {
    const src = analytics?.byType ? Object.entries(analytics.byType) : [];
    return src
      .map(([type, v]) => ({
        type,
        name: TYPE_LABELS[type] || type,
        avg: Number(v?.averageScore ?? 0),
        count: Number(v?.totalSessions ?? 0),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [analytics?.byType]);

  const trendData = useMemo(() => {
    return (analytics?.trend ?? []).map((p, idx) => ({
      idx,
      score: Number(p.averageScore ?? 0),
      label: p.weekStart
        ? new Date(p.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : `${idx}`,
    }));
  }, [analytics?.trend]);

  const sleeveRadarData = useMemo(() => {
    const entries = analytics?.sleeveAverages ? Object.entries(analytics.sleeveAverages) : [];
    return entries
      .map(([k, v]) => ({ skill: k, value: Number(v ?? 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [analytics?.sleeveAverages]);

  const sessionsAll = analytics?.recentSessions ?? [];

  const sessionsForTab = useMemo(() => {
    if (tab === 'overview' || tab === 'skills' || tab === 'trend' || tab === 'history') return sessionsAll;
    return sessionsAll.filter((s) => s.parentType === tab);
  }, [sessionsAll, tab]);

  const tabByType = useMemo(() => {
    if (tab === 'overview' || tab === 'skills' || tab === 'trend' || tab === 'history') return null;
    return analytics?.byType?.[tab] ?? null;
  }, [analytics?.byType, tab]);

  const tabTrendData = useMemo(() => {
    // Group sessions by week for the selected tab (or all).
    const src = sessionsForTab.filter((s) => !!s.savedAt);
    const map = new Map<string, { sum: number; n: number; label: string }>();
    for (const s of src) {
      const d = new Date(s.savedAt);
      if (Number.isNaN(d.getTime())) continue;
      // week key = YYYY-MM-DD of Monday (UTC-ish approximation using date_trunc logic client-side)
      const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      const dow = day.getUTCDay(); // 0..6 (Sun..Sat)
      const diff = (dow + 6) % 7; // days since Monday
      day.setUTCDate(day.getUTCDate() - diff);
      const key = day.toISOString().slice(0, 10);
      const cur = map.get(key) ?? {
        sum: 0,
        n: 0,
        label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };
      cur.sum += Number(s.overallScore ?? 0);
      cur.n += 1;
      map.set(key, cur);
    }
    const keys = Array.from(map.keys()).sort();
    const last = keys.slice(-12);
    return last.map((k, idx) => ({
      idx,
      score: map.get(k)!.n ? map.get(k)!.sum / map.get(k)!.n : 0,
      label: map.get(k)!.label,
    }));
  }, [sessionsForTab]);

  const tabSleeveRadarData = useMemo(() => {
    const agg = new Map<string, { sum: number; n: number }>();
    for (const s of sessionsForTab) {
      for (const [k, v] of Object.entries(s.sleeveScores || {})) {
        if (!Number.isFinite(v)) continue;
        const cur = agg.get(k) ?? { sum: 0, n: 0 };
        cur.sum += Number(v);
        cur.n += 1;
        agg.set(k, cur);
      }
    }
    return Array.from(agg.entries())
      .map(([k, v]) => ({ skill: k, value: v.n ? v.sum / v.n : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [sessionsForTab]);

  const recentRows = useMemo(() => {
    return sessionsForTab.slice(0, 25);
  }, [sessionsForTab]);

  return (
    <div className="b2b-page b2b-page--full">
      <div className="b2b-header">
        <h1 className="b2b-title">Student performance</h1>
      </div>
      <p className="b2b-subtitle">
        <Link className="b2b-link" to={ROUTES.TEACHER_CLASSES}>
          Back to My classes
        </Link>
      </p>
      {error ? <p className="b2b-error">{error}</p> : null}
      {!data ? (
        <p className="b2b-loading">Loading...</p>
      ) : (
        <>
          <section className="tsd-hero">
            <div className="tsd-hero__top">
              <div>
                <h2 className="tsd-hero__name">{data.student.name}</h2>
                <p className="tsd-hero__email">{data.student.email}</p>
                <div className="tsd-badges">
                  {data.classes.map((c) => (
                    <span key={c.classId} className="tsd-badge">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="tsd-scorebox">
                <p className="tsd-scorebox__label">Overall avg</p>
                <p className="tsd-scorebox__value">{(analytics?.totals.averageScore ?? data.summary.averageScore).toFixed(1)}%</p>
              </div>
            </div>

            <div className="tsd-metrics">
              <div className="tsd-metric">
                <p className="tsd-metric__label">Classes</p>
                <p className="tsd-metric__value">{data.summary.classCount}</p>
              </div>
              <div className="tsd-metric">
                <p className="tsd-metric__label">Recent feedbacks</p>
                <p className="tsd-metric__value">{data.summary.feedbackCount}</p>
              </div>
              <div className="tsd-metric">
                <p className="tsd-metric__label">Total sessions</p>
                <p className="tsd-metric__value">{analytics?.totals.sessions ?? 0}</p>
              </div>
              <div className="tsd-metric">
                <p className="tsd-metric__label">Top type</p>
                <p className="tsd-metric__value">{byTypeData[0]?.name ?? '—'}</p>
              </div>
            </div>
          </section>

          <div className="tsd-tabs" role="tablist" aria-label="Student performance tabs">
            <button
              type="button"
              className={`tsd-tab${tab === 'overview' ? ' tsd-tab--active' : ''}`}
              onClick={() => setTab('overview')}
            >
              Overview
            </button>
            {PARENT_TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={`tsd-tab${tab === t ? ' tsd-tab--active' : ''}`}
                onClick={() => setTab(t)}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
            <button
              type="button"
              className={`tsd-tab${tab === 'history' ? ' tsd-tab--active' : ''}`}
              onClick={() => setTab('history')}
            >
              History
            </button>
          </div>

          {tab === 'overview' ? (
            <section className="b2b-section">
              <h2 className="b2b-section-title">Overview</h2>
              <div className="tsd-grid">
                <div className="perf-chart">
                  <div className="perf-chart__inner">
                    <h3 className="perf-chart__title">Average score by interview type</h3>
                    {byTypeData.length === 0 ? (
                      <div className="perf-chart__empty">
                        <p className="perf-chart__empty-title">No breakdown yet</p>
                        <p className="perf-chart__empty-text">Once sessions exist, type breakdown will show here.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={byTypeData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
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
                          />
                          <Bar dataKey="avg" fill={chart.barFill} radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="perf-chart">
                  <div className="perf-chart__inner">
                    <h3 className="perf-chart__title">Top Overall Skills (avg)</h3>
                    {sleeveRadarData.length === 0 ? (
                      <div className="perf-chart__empty">
                        <p className="perf-chart__empty-title">No rubric data yet</p>
                        <p className="perf-chart__empty-text">This appears once feedback rubric scores exist.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={sleeveRadarData}>
                          <PolarGrid stroke={chart.trendGrid} />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: chart.trendAxis }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chart.trendAxis }} />
                          <Radar
                            dataKey="value"
                            stroke={chart.radarStroke}
                            fill={chart.radarFill}
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                          <Tooltip
                            contentStyle={chartTooltipContentStyle}
                            labelStyle={chartTooltipLabelStyle}
                            itemStyle={chartTooltipItemStyle}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Avg']}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {tab === 'skills' ? (
            <section className="b2b-section">
              <h2 className="b2b-section-title">Breakdown</h2>
              <div className="perf-chart">
                <div className="perf-chart__inner">
                  <h3 className="perf-chart__title">Sessions by type (count)</h3>
                  {byTypeData.length === 0 ? (
                    <div className="perf-chart__empty">
                      <p className="perf-chart__empty-title">No sessions yet</p>
                      <p className="perf-chart__empty-text">Session counts appear once the student completes interviews.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={byTypeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.trendGrid} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.trendAxis }} interval={0} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chart.trendAxis }} />
                        <Tooltip
                          contentStyle={chartTooltipContentStyle}
                          labelStyle={chartTooltipLabelStyle}
                          itemStyle={chartTooltipItemStyle}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [value, 'Sessions']}
                        />
                        <Bar dataKey="count" fill={chart.histogramFill} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {tab === 'trend' ? (
            <section className="b2b-section">
              <h2 className="b2b-section-title">Trend</h2>
              <div className="perf-chart">
                <div className="perf-chart__inner">
                  <h3 className="perf-chart__title">Weekly average score</h3>
                  {trendData.length === 0 ? (
                    <div className="perf-chart__empty">
                      <p className="perf-chart__empty-title">No trend yet</p>
                      <p className="perf-chart__empty-text">Trend appears after dated sessions.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={trendGradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chart.trendStroke} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={chart.trendStroke} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.trendGrid} />
                        <XAxis
                          dataKey="idx"
                          tickFormatter={(v: number) => trendData[v]?.label ?? ''}
                          tick={{ fontSize: 11, fill: chart.trendAxis }}
                        />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chart.trendAxis }} />
                        <Tooltip
                          contentStyle={chartTooltipContentStyle}
                          labelStyle={chartTooltipLabelStyle}
                          itemStyle={chartTooltipItemStyle}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(v: any) => [`${v}%`, 'Avg']}
                          cursor={{ stroke: chart.trendAxis, strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke={chart.trendStroke}
                          strokeWidth={2}
                          fill={`url(#${trendGradId})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {isParentTab(tab) ? (
            <section className="b2b-section">
              <h2 className="b2b-section-title">{TYPE_LABELS[tab]} performance</h2>

              <div className="tsd-metrics" style={{ marginTop: 0 }}>
                <div className="tsd-metric">
                  <p className="tsd-metric__label">Sessions</p>
                  <p className="tsd-metric__value">{tabByType?.totalSessions ?? 0}</p>
                </div>
                <div className="tsd-metric">
                  <p className="tsd-metric__label">Average</p>
                  <p className="tsd-metric__value">{(tabByType?.averageScore ?? 0).toFixed(1)}%</p>
                </div>
                <div className="tsd-metric">
                  <p className="tsd-metric__label">Recent sessions</p>
                  <p className="tsd-metric__value">{sessionsForTab.length}</p>
                </div>
                <div className="tsd-metric">
                  <p className="tsd-metric__label">Best recent</p>
                  <p className="tsd-metric__value">
                    {sessionsForTab.length ? Math.max(...sessionsForTab.map((s) => Number(s.overallScore ?? 0))).toFixed(1) : '—'}
                  </p>
                </div>
              </div>

              <div className="tsd-grid">
                <div className="perf-chart">
                  <div className="perf-chart__inner">
                    <h3 className="perf-chart__title">Trend (weekly average)</h3>
                    {tabTrendData.length === 0 ? (
                      <div className="perf-chart__empty">
                        <p className="perf-chart__empty-title">No trend yet</p>
                        <p className="perf-chart__empty-text">This category needs dated sessions.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={tabTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={typeTrendGradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chart.trendStroke} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={chart.trendStroke} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chart.trendGrid} />
                          <XAxis
                            dataKey="idx"
                            tickFormatter={(v: number) => tabTrendData[v]?.label ?? ''}
                            tick={{ fontSize: 11, fill: chart.trendAxis }}
                          />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chart.trendAxis }} />
                          <Tooltip
                            contentStyle={chartTooltipContentStyle}
                            labelStyle={chartTooltipLabelStyle}
                            itemStyle={chartTooltipItemStyle}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(v: any) => [`${v}%`, 'Avg']}
                            cursor={{ stroke: chart.trendAxis, strokeWidth: 1, strokeDasharray: '3 3' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke={chart.trendStroke}
                            strokeWidth={2}
                            fill={`url(#${typeTrendGradId})`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="perf-chart">
                  <div className="perf-chart__inner">
                    <h3 className="perf-chart__title">Rubric sleeves (avg)</h3>
                    {tabSleeveRadarData.length === 0 ? (
                      <div className="perf-chart__empty">
                        <p className="perf-chart__empty-title">No rubric data yet</p>
                        <p className="perf-chart__empty-text">This category has no rubric sleeve scores.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={tabSleeveRadarData}>
                          <PolarGrid stroke={chart.trendGrid} />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: chart.trendAxis }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chart.trendAxis }} />
                          <Radar
                            dataKey="value"
                            stroke={chart.radarStroke}
                            fill={chart.radarFill}
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                          <Tooltip
                            contentStyle={chartTooltipContentStyle}
                            labelStyle={chartTooltipLabelStyle}
                            itemStyle={chartTooltipItemStyle}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Avg']}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.85rem' }}>
                <h3 className="b2b-section-title" style={{ fontSize: 'var(--text-base)' }}>
                  Recent {TYPE_LABELS[tab]} sessions
                </h3>
                {recentRows.length === 0 ? (
                  <p className="b2b-empty">No sessions for this category yet.</p>
                ) : (
                  <div className="tsd-tablewrap">
                    <table className="tsd-table">
                      <thead>
                        <tr>
                          <th>Interview</th>
                          <th style={{ textAlign: 'right' }}>Score</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRows.map((r) => (
                          <tr key={r.feedbackId}>
                            <td style={{ fontWeight: 900 }}>{r.interviewTitle}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 900 }}>
                              {r.overallScore.toFixed(1)}%
                            </td>
                            <td>{r.savedAt ? new Date(r.savedAt).toLocaleString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {tab === 'history' ? (
            <section className="b2b-section">
              <h2 className="b2b-section-title">Interview history</h2>
              {recentRows.length === 0 ? (
                <p className="b2b-empty">No sessions yet.</p>
              ) : (
                <div className="tsd-tablewrap">
                  <table className="tsd-table">
                    <thead>
                      <tr>
                        <th>Interview</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>Score</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRows.map((r) => (
                        <tr key={r.feedbackId}>
                          <td style={{ fontWeight: 900 }}>{r.interviewTitle}</td>
                          <td>
                            <span className="tsd-pill">{TYPE_LABELS[r.parentType] || r.parentType}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 900 }}>
                            {r.overallScore.toFixed(1)}%
                          </td>
                          <td>{r.savedAt ? new Date(r.savedAt).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

type ParentTypeTab =
  | 'technical'
  | 'behavioral'
  | 'role-based'
  | 'case-study'
  | 'debate'
  | 'specialised'
  | 'miscellaneous';

type StudentTab = 'overview' | 'skills' | 'trend' | 'history' | ParentTypeTab;

const PARENT_TABS: ParentTypeTab[] = [
  'technical',
  'behavioral',
  'role-based',
  'case-study',
  'debate',
  'specialised',
  'miscellaneous',
];

function isParentTab(x: StudentTab): x is ParentTypeTab {
  return (PARENT_TABS as string[]).includes(x);
}

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'role-based': 'Role-based',
  'case-study': 'Case Study',
  debate: 'Debate',
  specialised: 'Specialised',
  miscellaneous: 'Miscellaneous',
};
