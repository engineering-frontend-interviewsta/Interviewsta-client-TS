import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
  createTeacherClassAnnouncement,
  createTeacherClassAssignment,
  deleteTeacherClassAnnouncement,
  deleteTeacherClassAssignment,
  getTeacherClassAnalytics,
  getTeacherClassAnnouncements,
  getTeacherClassAssignments,
  getTeacherClassDetail,
  type TeacherClassAnalyticsResponse,
  type TeacherClassAnnouncement,
  type TeacherClassAssignment,
} from '../../../services/b2bService';
import '../../B2B/B2B.css';
import '../../Dashboard/components/PerformanceCharts.css';
import './TeacherClassDetail.css';

type TeacherClassDetailResponse = {
  class: { classId: string; name: string; code: string; description: string };
  students: Array<{
    studentUserId: string;
    name: string;
    email: string;
    averageScore: number;
    feedbackCount: number;
  }>;
};

export default function TeacherClassDetailPage() {
  const { roles } = useAuth();
  const { classId = '' } = useParams();
  const [data, setData] = useState<TeacherClassDetailResponse | null>(null);
  const [analytics, setAnalytics] = useState<TeacherClassAnalyticsResponse | null>(null);
  const [announcements, setAnnouncements] = useState<TeacherClassAnnouncement[]>([]);
  const [assignments, setAssignments] = useState<TeacherClassAssignment[]>([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'students' | 'analytics' | 'announcements' | 'assignments'>('students');
  const [copied, setCopied] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');

  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [announcementBusy, setAnnouncementBusy] = useState(false);

  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueAt, setAssignmentDueAt] = useState<string>('');
  const [assignmentBusy, setAssignmentBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await getTeacherClassDetail(classId);
        setData(response.data as TeacherClassDetailResponse);
        const analyticsRes = await getTeacherClassAnalytics(classId);
        setAnalytics(analyticsRes.data);
        const [aRes, asRes] = await Promise.all([
          getTeacherClassAnnouncements(classId),
          getTeacherClassAssignments(classId),
        ]);
        setAnnouncements(aRes.data);
        setAssignments(asRes.data);
      } catch {
        setError('Unable to load class detail');
      }
    })();
  }, [classId]);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    const rows = q
      ? data?.students.filter((s) => (s.name + ' ' + s.email).toLowerCase().includes(q)) ?? []
      : data?.students ?? [];
    return [...rows].sort((a, b) => {
      const byAvg = (b.averageScore ?? 0) - (a.averageScore ?? 0);
      if (byAvg !== 0) return byAvg;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [data?.students, studentQuery]);

  if (!roles?.includes('teacher')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="b2b-page b2b-page--full">
      <div className="b2b-header">
        <h1 className="b2b-title">Class</h1>
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
          <section className="tcd-hero">
            <div className="tcd-hero__top">
              <div className="tcd-hero__titlewrap">
                <h2 className="tcd-hero__title">{data.class.name}</h2>
                <p className="tcd-hero__subtitle">{data.class.description || 'No description added.'}</p>
              </div>
              <div className="tcd-hero__code">
                <span className="tcd-hero__code-label">Class code</span>
                <span className="tcd-hero__code-value">{data.class.code}</span>
                <button
                  type="button"
                  className="tcd-hero__copy"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(data.class.code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="tcd-metrics">
              <div className="tcd-metric">
                <p className="tcd-metric__label">Students</p>
                <p className="tcd-metric__value">{analytics?.totals.students ?? data.students.length}</p>
              </div>
              <div className="tcd-metric">
                <p className="tcd-metric__label">Total sessions</p>
                <p className="tcd-metric__value">{analytics?.totals.sessions ?? 0}</p>
              </div>
              <div className="tcd-metric">
                <p className="tcd-metric__label">Class average</p>
                <p className="tcd-metric__value">{(analytics?.totals.averageScore ?? 0).toFixed(1)}%</p>
              </div>
              <div className="tcd-metric">
                <p className="tcd-metric__label">Top student</p>
                <p className="tcd-metric__value">
                  {analytics?.rankings?.[0]?.name ? `#1 ${analytics.rankings[0].name}` : '—'}
                </p>
              </div>
            </div>
          </section>

          <div className="tcd-tabs" role="tablist" aria-label="Class sections">
            <button
              type="button"
              className={`tcd-tab${tab === 'students' ? ' tcd-tab--active' : ''}`}
              onClick={() => setTab('students')}
            >
              Students
            </button>
            <button
              type="button"
              className={`tcd-tab${tab === 'analytics' ? ' tcd-tab--active' : ''}`}
              onClick={() => setTab('analytics')}
            >
              Analytics
            </button>
            <button
              type="button"
              className={`tcd-tab${tab === 'announcements' ? ' tcd-tab--active' : ''}`}
              onClick={() => setTab('announcements')}
            >
              Announcements
            </button>
            <button
              type="button"
              className={`tcd-tab${tab === 'assignments' ? ' tcd-tab--active' : ''}`}
              onClick={() => setTab('assignments')}
            >
              Assignments
            </button>
          </div>

          {tab === 'students' ? (
            <section className="b2b-section">
              <div className="tcd-sectionhead">
                <div>
                  <h2 className="b2b-section-title">Students</h2>
                  <p className="tcd-muted" style={{ marginTop: '0.35rem' }}>
                    {data.students.length} total · sorted by average score
                  </p>
                </div>
                <input
                  className="b2b-input tcd-search"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search students…"
                />
              </div>

              {filteredStudents.length === 0 ? (
                <p className="b2b-empty">No students found.</p>
              ) : (
                <div className="tcd-tablewrap">
                  <table className="tcd-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th style={{ textAlign: 'right' }}>Avg</th>
                        <th style={{ textAlign: 'right' }}>Feedbacks</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s.studentUserId}>
                          <td className="tcd-td-name">{s.name}</td>
                          <td className="tcd-td-email">{s.email}</td>
                          <td style={{ textAlign: 'right' }}>{s.averageScore.toFixed(1)}%</td>
                          <td style={{ textAlign: 'right' }}>{s.feedbackCount}</td>
                          <td style={{ textAlign: 'right' }}>
                            <Link className="tcd-open" to={`/teacher/students/${s.studentUserId}`}>
                              Open →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          {tab === 'analytics' ? <AnalyticsSection analytics={analytics} students={data.students} /> : null}

          {tab === 'announcements' ? (
            <section className="b2b-section">
              <div className="tcd-sectionhead">
                <div>
                  <h2 className="b2b-section-title">Announcements</h2>
                  <p className="tcd-muted" style={{ marginTop: '0.35rem' }}>
                    Post updates for your class. Pinned items stay on top.
                  </p>
                </div>
                <button type="button" className="b2b-button" onClick={() => setAnnouncementOpen(true)}>
                  + New announcement
                </button>
              </div>

              <div className="tcd-stack">
                {announcements.map((a) => (
                  <div key={a.id} className={`tcd-card${a.isPinned ? ' tcd-card--pinned' : ''}`}>
                    <div className="tcd-card__top">
                      <div>
                        <p className="tcd-card__title">
                          {a.isPinned ? <span className="tcd-pill">Pinned</span> : null} {a.title}
                        </p>
                        <p className="tcd-card__meta">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="tcd-danger"
                        onClick={async () => {
                          if (!confirm('Delete this announcement?')) return;
                          await deleteTeacherClassAnnouncement(classId, a.id);
                          const refreshed = await getTeacherClassAnnouncements(classId);
                          setAnnouncements(refreshed.data);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    {a.body ? <p className="tcd-card__body">{a.body}</p> : null}
                  </div>
                ))}
                {announcements.length === 0 ? <p className="b2b-empty">No announcements yet.</p> : null}
              </div>
            </section>
          ) : null}

          {tab === 'assignments' ? (
            <section className="b2b-section">
              <div className="tcd-sectionhead">
                <div>
                  <h2 className="b2b-section-title">Assignments</h2>
                  <p className="tcd-muted" style={{ marginTop: '0.35rem' }}>
                    Create tasks for students. (File uploads/submissions can be added next.)
                  </p>
                </div>
                <button type="button" className="b2b-button" onClick={() => setAssignmentOpen(true)}>
                  + New assignment
                </button>
              </div>

              <div className="tcd-stack">
                {assignments.map((a) => (
                  <div key={a.id} className="tcd-card">
                    <div className="tcd-card__top">
                      <div>
                        <p className="tcd-card__title">{a.title}</p>
                        <p className="tcd-card__meta">
                          Created {new Date(a.createdAt).toLocaleString()}
                          {a.dueAt ? ` · Due ${new Date(a.dueAt).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="tcd-danger"
                        onClick={async () => {
                          if (!confirm('Delete this assignment?')) return;
                          await deleteTeacherClassAssignment(classId, a.id);
                          const refreshed = await getTeacherClassAssignments(classId);
                          setAssignments(refreshed.data);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    {a.description ? <p className="tcd-card__body">{a.description}</p> : null}
                  </div>
                ))}
                {assignments.length === 0 ? <p className="b2b-empty">No assignments yet.</p> : null}
              </div>
            </section>
          ) : null}
        </>
      )}

      {announcementOpen ? (
        <div
          className="b2b-modal"
          role="dialog"
          aria-modal="true"
          aria-label="New announcement"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAnnouncementOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setAnnouncementOpen(false);
          }}
        >
          <div className="b2b-modal-card">
            <div className="tcd-modalhead">
              <div>
                <h2 className="tcd-modaltitle">New announcement</h2>
                <p className="tcd-muted" style={{ marginTop: '0.25rem' }}>
                  Visible to all students in this class.
                </p>
              </div>
              <button type="button" className="tcd-x" onClick={() => setAnnouncementOpen(false)}>
                ✕
              </button>
            </div>
            <form
              className="b2b-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setAnnouncementBusy(true);
                try {
                  await createTeacherClassAnnouncement(classId, {
                    title: announcementTitle,
                    body: announcementBody,
                    isPinned: announcementPinned,
                  });
                  setAnnouncementTitle('');
                  setAnnouncementBody('');
                  setAnnouncementPinned(false);
                  setAnnouncementOpen(false);
                  const refreshed = await getTeacherClassAnnouncements(classId);
                  setAnnouncements(refreshed.data);
                } finally {
                  setAnnouncementBusy(false);
                }
              }}
            >
              <input
                className="b2b-input"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <textarea
                className="b2b-textarea"
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                placeholder="Message (optional)"
              />
              <label className="tcd-check">
                <input
                  type="checkbox"
                  checked={announcementPinned}
                  onChange={(e) => setAnnouncementPinned(e.target.checked)}
                />
                Pin this announcement
              </label>
              <div className="tcd-actionsrow">
                <button type="button" className="tcd-secondary" onClick={() => setAnnouncementOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="b2b-button" disabled={announcementBusy}>
                  {announcementBusy ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {assignmentOpen ? (
        <div
          className="b2b-modal"
          role="dialog"
          aria-modal="true"
          aria-label="New assignment"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAssignmentOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setAssignmentOpen(false);
          }}
        >
          <div className="b2b-modal-card">
            <div className="tcd-modalhead">
              <div>
                <h2 className="tcd-modaltitle">New assignment</h2>
                <p className="tcd-muted" style={{ marginTop: '0.25rem' }}>
                  Add a due date if you want.
                </p>
              </div>
              <button type="button" className="tcd-x" onClick={() => setAssignmentOpen(false)}>
                ✕
              </button>
            </div>
            <form
              className="b2b-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setAssignmentBusy(true);
                try {
                  await createTeacherClassAssignment(classId, {
                    title: assignmentTitle,
                    description: assignmentDesc,
                    dueAt: assignmentDueAt ? new Date(assignmentDueAt).toISOString() : null,
                  });
                  setAssignmentTitle('');
                  setAssignmentDesc('');
                  setAssignmentDueAt('');
                  setAssignmentOpen(false);
                  const refreshed = await getTeacherClassAssignments(classId);
                  setAssignments(refreshed.data);
                } finally {
                  setAssignmentBusy(false);
                }
              }}
            >
              <input
                className="b2b-input"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <textarea
                className="b2b-textarea"
                value={assignmentDesc}
                onChange={(e) => setAssignmentDesc(e.target.value)}
                placeholder="Description (optional)"
              />
              <label className="tcd-field">
                <span className="tcd-field__label">Due date (optional)</span>
                <input
                  className="b2b-input"
                  type="datetime-local"
                  value={assignmentDueAt}
                  onChange={(e) => setAssignmentDueAt(e.target.value)}
                />
              </label>
              <div className="tcd-actionsrow">
                <button type="button" className="tcd-secondary" onClick={() => setAssignmentOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="b2b-button" disabled={assignmentBusy}>
                  {assignmentBusy ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
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

function AnalyticsSection({
  analytics,
  students,
}: {
  analytics: TeacherClassAnalyticsResponse | null;
  students: TeacherClassDetailResponse['students'];
}) {
  const { resolvedTheme } = useTheme();
  const chart = useMemo(() => getDashboardChartPalette(resolvedTheme), [resolvedTheme]);
  const trendGradientId = `tcdTrendGradient-${resolvedTheme}`;
  const rankings = analytics?.rankings ?? [];

  const byTypeData = useMemo(() => {
    const entries = analytics?.byType ? Object.entries(analytics.byType) : [];
    return entries
      .map(([type, val]) => ({
        type,
        name: TYPE_LABELS[type] || type,
        avg: Number(val?.averageScore ?? 0),
        count: Number(val?.totalSessions ?? 0),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [analytics?.byType]);

  const trendData = useMemo(() => {
    return (analytics?.trend ?? []).map((p, idx) => ({
      idx,
      score: Number(p.averageScore ?? 0),
      label: p.weekStart ? new Date(p.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `${idx}`,
    }));
  }, [analytics?.trend]);

  const scoreDistribution = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i === 9 ? 100 : i * 10 + 10}`,
      count: 0,
    }));
    for (const r of rankings) {
      const s = Number(r.averageScore ?? 0);
      const idx = Math.min(9, Math.max(0, Math.floor(s / 10)));
      buckets[idx].count += 1;
    }
    return buckets;
  }, [rankings]);

  const sessionsByType = useMemo(() => {
    const entries = analytics?.byType ? Object.entries(analytics.byType) : [];
    return entries
      .map(([type, val]) => ({
        type,
        name: TYPE_LABELS[type] || type,
        value: Number(val?.totalSessions ?? 0),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [analytics?.byType]);

  const sessionsByTypeTotal = useMemo(() => {
    return sessionsByType.reduce((sum, x) => sum + Number(x.value || 0), 0);
  }, [sessionsByType]);

  const sessionsByTypeColors = useMemo(() => {
    return sessionsByType.map((_, idx) => chart.pieColors[idx % chart.pieColors.length]);
  }, [sessionsByType, chart]);

  return (
    <section className="b2b-section">
      <h2 className="b2b-section-title">Class analytics</h2>

      {!analytics ? (
        <p className="b2b-loading">Loading analytics…</p>
      ) : (
        <div className="tcd-analytics">
          <div className="perf-chart">
            <div className="perf-chart__inner">
              <h3 className="perf-chart__title">Average score by interview type</h3>
              {byTypeData.length === 0 ? (
                <div className="perf-chart__empty">
                  <p className="perf-chart__empty-title">No breakdown yet</p>
                  <p className="perf-chart__empty-text">When students complete interviews, the breakdown appears here.</p>
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, _name, props: any) => {
                        const count = props?.payload?.count ?? 0;
                        const pct = Number(value ?? 0).toFixed(1);
                        return [`${pct}% avg · ${count} sessions`, 'Score'];
                      }}
                    />
                    <Bar dataKey="avg" fill={chart.barFill} radius={[0, 6, 6, 0]} name="Average" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="perf-chart">
            <div className="perf-chart__inner">
              <h3 className="perf-chart__title">Trend (weekly class average)</h3>
              {trendData.length === 0 ? (
                <div className="perf-chart__empty">
                  <p className="perf-chart__empty-title">No trend yet</p>
                  <p className="perf-chart__empty-text">Trend appears once there are dated sessions.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={trendGradientId} x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(value: any) => [`${Number(value ?? 0).toFixed(1)}%`, 'Average']}
                      cursor={{ stroke: chart.trendAxis, strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={chart.trendStroke}
                      strokeWidth={2}
                      fill={`url(#${trendGradientId})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="perf-chart">
            <div className="perf-chart__inner">
              <h3 className="perf-chart__title">Score distribution (student averages)</h3>
              {scoreDistribution.every((b) => b.count === 0) ? (
                <div className="perf-chart__empty">
                  <p className="perf-chart__empty-title">No scores yet</p>
                  <p className="perf-chart__empty-text">Distribution appears once students have sessions.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.trendGrid} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: chart.trendAxis }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chart.trendAxis }} />
                    <Tooltip
                      contentStyle={chartTooltipContentStyle}
                      labelStyle={chartTooltipLabelStyle}
                      itemStyle={chartTooltipItemStyle}
                    />
                    <Bar dataKey="count" fill={chart.histogramFill} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="perf-chart">
            <div className="perf-chart__inner">
              <h3 className="perf-chart__title">Sessions by interview type</h3>
              {sessionsByType.length === 0 ? (
                <div className="perf-chart__empty">
                  <p className="perf-chart__empty-title">No sessions yet</p>
                  <p className="perf-chart__empty-text">Once sessions exist, you’ll see where the class practices most.</p>
                </div>
              ) : (
                <div className="tcd-donut">
                  <div className="tcd-donut__chart">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={sessionsByType}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={58}
                          paddingAngle={2}
                        >
                          {sessionsByType.map((_, idx) => (
                            <Cell
                              // eslint-disable-next-line react/no-array-index-key
                              key={idx}
                              fill={sessionsByTypeColors[idx]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={chartTooltipContentStyle}
                          labelStyle={chartTooltipLabelStyle}
                          itemStyle={chartTooltipItemStyle}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any, _name: any, props: any) => {
                            const v = Number(value || 0);
                            const pct =
                              sessionsByTypeTotal > 0 ? Math.round((v / sessionsByTypeTotal) * 100) : 0;
                            const label = props?.payload?.name ?? 'Sessions';
                            return [`${v} (${pct}%)`, label];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="tcd-donut__center" aria-hidden>
                      <p className="tcd-donut__total">{sessionsByTypeTotal}</p>
                      <p className="tcd-donut__label">sessions</p>
                    </div>
                  </div>

                  <div className="tcd-donut__legend" aria-label="Legend">
                    {sessionsByType.map((x, idx) => {
                      const pct = sessionsByTypeTotal > 0 ? (x.value / sessionsByTypeTotal) * 100 : 0;
                      return (
                        <div key={x.type} className="tcd-donut__row">
                          <span
                            className="tcd-donut__swatch"
                            style={{ background: sessionsByTypeColors[idx] }}
                            aria-hidden
                          />
                          <span className="tcd-donut__name">{x.name}</span>
                          <span className="tcd-donut__meta">
                            {x.value} · {pct.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tcd-rankings">
            <div className="tcd-rankings__head">
              <h3 className="tcd-rankings__title">Student rankings</h3>
              <p className="tcd-rankings__subtitle">Sorted by average score (ties by sessions).</p>
            </div>
            <div className="tcd-rankings__list">
              {rankings.length === 0 ? (
                <p className="b2b-empty" style={{ margin: 0 }}>
                  No ranking yet.
                </p>
              ) : (
                rankings.slice(0, 15).map((r) => (
                  <div key={r.studentUserId} className="tcd-rankings__row">
                    <div className="tcd-rankings__left">
                      <span className="tcd-rankings__badge">#{r.rank}</span>
                      <div className="tcd-rankings__who">
                        <p className="tcd-rankings__name">{r.name}</p>
                        <p className="tcd-rankings__email">{r.email}</p>
                      </div>
                    </div>
                    <div className="tcd-rankings__right">
                      <span className="tcd-rankings__score">{r.averageScore.toFixed(1)}%</span>
                      <span className="tcd-rankings__meta">{r.totalSessions} sessions</span>
                      <Link className="b2b-link" to={`/teacher/students/${r.studentUserId}`}>
                        Open
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="tcd-muted">
              Students in this class: {students.length}. Ranking shows up to top 15.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
