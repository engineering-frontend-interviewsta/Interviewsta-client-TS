import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getAdminUsers,
  updateUserTier,
  deleteUser,
} from '../../../services/adminService';
import { ROUTES } from '../../../constants/routerConstants';
import type { AdminUser } from '../../../types/admin';

const TIER_OPTIONS = [
  { value: 0, label: 'Free' },
  { value: 1, label: 'Pro' },
  { value: 2, label: 'Pro Plus' },
  { value: 3, label: 'Organisation' },
  { value: 4, label: 'Developer' },
];

function DeleteModal({
  user,
  onConfirm,
  onCancel,
  deleting,
}: {
  user: AdminUser | null;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  if (!user) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-slate-900/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          aria-hidden
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 id="delete-title" className="text-base font-semibold text-slate-900">
            Delete account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Permanently delete <strong>{user.name}</strong> ({user.email})? All interviews,
            resumes, and billing data will be removed. This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TierBadge({ tier, tierName }: { tier: number; tierName: string }) {
  const styles: Record<number, string> = {
    0: 'bg-slate-100 text-slate-700',
    1: 'bg-indigo-100 text-indigo-700',
    2: 'bg-violet-100 text-violet-700',
    3: 'bg-amber-100 text-amber-700',
    4: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${styles[tier] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {tierName}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    student: 'bg-slate-100 text-slate-700',
    teacher: 'bg-slate-100 text-slate-600',
    admin: 'bg-slate-200 text-slate-800',
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${styles[role] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {role}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingTier, setUpdatingTier] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers(p);
      setUsers(res.results ?? []);
      setTotalCount(res.count ?? 0);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleTierChange = async (userId: number, newTier: number) => {
    setUpdatingTier(userId);
    try {
      const updated = await updateUserTier(userId, newTier);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                tier: updated.tier,
                tier_name: updated.tier_name,
                total_credits: updated.total_credits,
                remaining_credits: updated.remaining_credits,
              }
            : u
        )
      );
    } catch {
      alert('Update failed.');
    } finally {
      setUpdatingTier(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setTotalCount((c) => c - 1);
      setDeleteTarget(null);
    } catch {
      alert('Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.app_role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-slate-50/80 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">User management</h1>
            <p className="mt-0.5 text-sm text-slate-500">{totalCount} users</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchUsers(page)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </header>

        {error != null && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 sm:w-40"
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Tier</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Credits</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Interviews</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Tier</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      No users match.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.app_role} />
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={u.tier} tierName={u.tier_name} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {u.remaining_credits === -1 ? '∞' : u.remaining_credits}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {u.interview_count ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {new Date(u.date_joined).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.tier}
                          disabled={updatingTier === u.id}
                          onChange={(e) => handleTierChange(u.id, Number(e.target.value))}
                          className="rounded border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
                        >
                          {TIER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {updatingTier === u.id && (
                          <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="mt-6">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            ← Dashboard
          </Link>
        </p>
      </div>

      <DeleteModal
        user={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}
