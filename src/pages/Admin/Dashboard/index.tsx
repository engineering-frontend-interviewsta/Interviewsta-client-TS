import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Award,
  FileText,
  Video,
  BarChart3,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  UserCog,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { getAdminDashboard } from '../../../services/adminService';
import { ROUTES } from '../../../constants/routerConstants';
import type { AdminDashboardData } from '../../../types/admin';
import './AdminDashboard.css';

const TIER_FILL: Record<string, string> = {
  Free: '#94a3b8',
  Pro: '#6366f1',
  'Pro Plus': '#a855f7',
  Organisation: '#f97316',
  Developer: '#22c55e',
};

const TYPE_FILL = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#a855f7', '#ec4899'];

function StatBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="admin-dashboard__stat-block">
      <div className="admin-dashboard__stat-icon">
        <Icon aria-hidden />
      </div>
      <div>
        <p className="admin-dashboard__stat-value">{value}</p>
        <p className="admin-dashboard__stat-label">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
      setData(res);
    } catch {
      setError('Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="admin-dashboard__loading">
        <div className="admin-dashboard__loading-inner">
          <div className="admin-dashboard__loading-title" />
          <div className="admin-dashboard__loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="admin-dashboard__loading-block" />
            ))}
          </div>
          <div className="admin-dashboard__loading-chart" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard__error-wrap">
        <div className="admin-dashboard__error-inner">
          <AlertCircle className="admin-dashboard__error-icon" aria-hidden />
          <p className="admin-dashboard__error-msg">{error}</p>
          <button type="button" onClick={fetchDashboard} className="admin-dashboard__error-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data == null) return null;

  const {
    overview,
    users_by_tier,
    interview_type_breakdown,
    monthly_trend,
    top_performers,
    bottom_performers,
  } = data;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__inner">
        <header className="admin-dashboard__header">
          <div>
            <h1 className="admin-dashboard__title">Dashboard</h1>
            <p className="admin-dashboard__subtitle">Platform overview</p>
          </div>
          <div className="admin-dashboard__actions">
            <button type="button" onClick={fetchDashboard} className="admin-dashboard__btn-secondary">
              <RefreshCw aria-hidden />
              Refresh
            </button>
            <Link to={ROUTES.ADMIN_USERS} className="admin-dashboard__btn-primary">
              <UserCog aria-hidden />
              Users
            </Link>
          </div>
        </header>

        <section className="admin-dashboard__stat-grid">
          <StatBlock label="Total users" value={overview.total_users} icon={Users} />
          <StatBlock label="Avg. interview score" value={`${overview.avg_score}%`} icon={Award} />
          <StatBlock label="Interviews" value={overview.total_interviews} icon={Video} />
          <StatBlock label="Resume analyses" value={overview.total_resumes} icon={FileText} />
        </section>

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__section-grid">
            <div className="admin-dashboard__card">
              <h2 className="admin-dashboard__card-title">
                <LayoutGrid aria-hidden />
                Users by tier
              </h2>
              {users_by_tier.length === 0 ? (
                <p className="admin-dashboard__empty">No data</p>
              ) : (
                <div className="admin-dashboard__chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={users_by_tier} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="tier_name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          fontSize: 12,
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          backgroundColor: '#fff',
                        }}
                        formatter={(v: number) => [v, 'Users']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {users_by_tier.map((e) => (
                          <Cell key={e.tier_name} fill={TIER_FILL[e.tier_name] ?? '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="admin-dashboard__card">
              <h2 className="admin-dashboard__card-title">
                <BarChart3 aria-hidden />
                Interview types
              </h2>
              {interview_type_breakdown.length === 0 ? (
                <p className="admin-dashboard__empty">No data</p>
              ) : (
                <div className="admin-dashboard__chart-wrap admin-dashboard__chart-wrap--pie">
                  <div className="admin-dashboard__chart-pie">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={interview_type_breakdown}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={36}
                          paddingAngle={1}
                        >
                          {interview_type_breakdown.map((e, i) => (
                            <Cell key={e.type} fill={TYPE_FILL[i % TYPE_FILL.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            fontSize: 12,
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            backgroundColor: '#fff',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="admin-dashboard__legend-list">
                    {interview_type_breakdown.map((e, i) => (
                      <li key={e.type} className="admin-dashboard__legend-item">
                        <span
                          className="admin-dashboard__legend-dot"
                          style={{ backgroundColor: TYPE_FILL[i % TYPE_FILL.length] }}
                        />
                        <span className="admin-dashboard__legend-label">{e.type}</span>
                        <span className="admin-dashboard__legend-value">{e.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__card">
            <h2 className="admin-dashboard__card-title">
              <TrendingUp aria-hidden />
              Monthly activity (last 6 months)
            </h2>
            {monthly_trend.length === 0 ? (
              <p className="admin-dashboard__empty">No data</p>
            ) : (
              <div className="admin-dashboard__chart-wrap" style={{ height: '16rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly_trend} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis yAxisId="L" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                    <YAxis yAxisId="R" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        backgroundColor: '#fff',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      yAxisId="L"
                      type="monotone"
                      dataKey="sessions"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Sessions"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="R"
                      type="monotone"
                      dataKey="avg_score"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Avg score %"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__section-grid">
            <div className="admin-dashboard__card">
              <h2 className="admin-dashboard__card-title">Top performers</h2>
              {top_performers.length === 0 ? (
                <p className="admin-dashboard__empty">No data</p>
              ) : (
                <ul className="admin-dashboard__performer-list">
                  {top_performers.map((s, i) => (
                    <li key={s.id} className="admin-dashboard__performer-item">
                      <span className="admin-dashboard__performer-rank">{i + 1}</span>
                      <div className="admin-dashboard__performer-info">
                        <p className="admin-dashboard__performer-name">{s.name}</p>
                        <p className="admin-dashboard__performer-meta">{s.email} · {s.sessions} sessions</p>
                      </div>
                      <span className="admin-dashboard__performer-score admin-dashboard__performer-score--high">{s.avg_score}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-dashboard__card">
              <h2 className="admin-dashboard__card-title">Need attention</h2>
              {bottom_performers.length === 0 ? (
                <p className="admin-dashboard__empty">No data</p>
              ) : (
                <ul className="admin-dashboard__performer-list">
                  {bottom_performers.map((s, i) => (
                    <li key={s.id} className="admin-dashboard__performer-item">
                      <span className="admin-dashboard__performer-rank">{i + 1}</span>
                      <div className="admin-dashboard__performer-info">
                        <p className="admin-dashboard__performer-name">{s.name}</p>
                        <p className="admin-dashboard__performer-meta">{s.email} · {s.sessions} sessions</p>
                      </div>
                      <span className="admin-dashboard__performer-score admin-dashboard__performer-score--low">{s.avg_score}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <Link to={ROUTES.DASHBOARD} className="admin-dashboard__back">
          ← Back to main dashboard
        </Link>
      </div>
    </div>
  );
}
