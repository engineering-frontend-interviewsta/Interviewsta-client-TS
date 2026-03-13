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
    <div className="flex items-start gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
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
      <div className="min-h-screen bg-slate-50/80 p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-black/5" />
            ))}
          </div>
          <div className="mt-8 h-80 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-black/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/80 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-700">{error}</p>
          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
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
    <div className="min-h-screen bg-slate-50/80 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">Platform overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboard}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              to={ROUTES.ADMIN_USERS}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              <UserCog className="h-4 w-4" />
              Users
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Total users" value={overview.total_users} icon={Users} />
          <StatBlock
            label="Avg. interview score"
            value={`${overview.avg_score}%`}
            icon={Award}
          />
          <StatBlock label="Interviews" value={overview.total_interviews} icon={Video} />
          <StatBlock label="Resume analyses" value={overview.total_resumes} icon={FileText} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <LayoutGrid className="h-4 w-4 text-slate-500" />
              Users by tier
            </h2>
            {users_by_tier.length === 0 ? (
              <p className="mt-6 py-8 text-center text-sm text-slate-400">No data</p>
            ) : (
              <div className="mt-4 h-56">
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

          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Interview types
            </h2>
            {interview_type_breakdown.length === 0 ? (
              <p className="mt-6 py-8 text-center text-sm text-slate-400">No data</p>
            ) : (
              <div className="mt-4 flex items-center gap-6">
                <div className="h-44 w-44 shrink-0">
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
                <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
                  {interview_type_breakdown.map((e, i) => (
                    <li key={e.type} className="flex items-center justify-between gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: TYPE_FILL[i % TYPE_FILL.length] }}
                      />
                      <span className="truncate text-slate-600">{e.type}</span>
                      <span className="font-medium text-slate-800">{e.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            Monthly activity (last 6 months)
          </h2>
          {monthly_trend.length === 0 ? (
            <p className="mt-6 py-8 text-center text-sm text-slate-400">No data</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly_trend} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis yAxisId="L" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <YAxis
                    yAxisId="R"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    domain={[0, 100]}
                  />
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
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-semibold text-slate-800">Top performers</h2>
            {top_performers.length === 0 ? (
              <p className="mt-4 py-6 text-center text-sm text-slate-400">No data</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {top_performers.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-200 text-xs font-semibold text-slate-700">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{s.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {s.email} · {s.sessions} sessions
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-emerald-600">
                      {s.avg_score}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-semibold text-slate-800">Need attention</h2>
            {bottom_performers.length === 0 ? (
              <p className="mt-4 py-6 text-center text-sm text-slate-400">No data</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {bottom_performers.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-200 text-xs font-semibold text-slate-700">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{s.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {s.email} · {s.sessions} sessions
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-rose-600">
                      {s.avg_score}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="mt-8">
          <Link to={ROUTES.DASHBOARD} className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            ← Back to main dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
