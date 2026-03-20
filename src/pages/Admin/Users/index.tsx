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
  getNestAdminUsers,
  updateNestUserRole,
  deleteNestUser,
} from '../../../services/adminService';
import { ROUTES } from '../../../constants/routerConstants';
import type { AdminUserView } from '../../../types/account';
import './AdminUsers.css';

const ROLE_OPTIONS = [
  { value: 'user',        label: 'User'         },
  { value: 'student',     label: 'Student'      },
  { value: 'teacher',     label: 'Teacher'      },
  { value: 'admin',       label: 'Admin'        },
  { value: 'admin_staff', label: 'Admin Staff'  },
  { value: 'developer',   label: 'Developer'    },
];

function DeleteModal({
  user,
  onConfirm,
  onCancel,
  deleting,
}: {
  user: AdminUserView | null;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  if (!user) return null;
  return (
    <AnimatePresence>
      <div className="admin-users__modal-overlay">
        <motion.div
          className="admin-users__modal-backdrop"
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
          className="admin-users__modal"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
        >
          <button type="button" onClick={onCancel} className="admin-users__modal-close" aria-label="Close">
            <X aria-hidden />
          </button>
          <h2 id="delete-title" className="admin-users__modal-title">Delete account</h2>
          <p className="admin-users__modal-body">
            Permanently delete <strong>{user.name}</strong> ({user.email})? All interviews,
            resumes, and billing data will be removed. This cannot be undone.
          </p>
          <div className="admin-users__modal-actions">
            <button type="button" onClick={onCancel} disabled={deleting} className="admin-users__modal-btn-cancel">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={deleting} className="admin-users__modal-btn-delete">
              {deleting ? <span className="admin-users__modal-spinner" /> : 'Delete'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`admin-users__badge admin-users__badge--role-${role}`}>
      {role}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserView | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNestAdminUsers(p);
      setUsers(res.data ?? []);
      setTotalCount(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    try {
      const updated = await updateNestUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: updated.roles, isWhitelisted: updated.isWhitelisted } : u))
      );
    } catch {
      alert('Role update failed.');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNestUser(deleteTarget.id);
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
    const matchRole = roleFilter === 'all' || u.roles.includes(roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div className="admin-users">
      <div className="admin-users__inner">
        <header className="admin-users__header">
          <div>
            <h1 className="admin-users__title">User management</h1>
            <p className="admin-users__count">{totalCount} users</p>
          </div>
          <div className="admin-users__actions">
            <button type="button" onClick={() => fetchUsers(page)} className="admin-users__btn-secondary">
              <RefreshCw aria-hidden />
              Refresh
            </button>
            <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-users__btn-primary">
              <LayoutGrid aria-hidden />
              Dashboard
            </Link>
          </div>
        </header>

        {error != null && (
          <div className="admin-users__error" role="alert">
            <AlertCircle aria-hidden />
            {error}
          </div>
        )}

        <div className="admin-users__toolbar">
          <div className="admin-users__search-wrap">
            <Search className="admin-users__search-icon" aria-hidden />
            <input
              type="text"
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-users__search-input"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-users__role-select"
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="developer">Developer</option>
          </select>
        </div>

        <div className="admin-users__card">
          <div className="admin-users__table-wrap">
            <table className="admin-users__table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>ID</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Interviews</th>
                  <th>Joined</th>
                  <th>Change Role</th>
                  <th style={{ width: '2.5rem' }} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <td key={j} className="admin-users__loading-cell">
                          <div className="admin-users__loading-skeleton" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-users__empty">
                      No users match.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <p className="admin-users__user-name">{u.name}</p>
                        <p className="admin-users__user-email">{u.email}</p>
                      </td>
                      <td>
                        <code className="admin-users__user-id">{u.id.slice(0, 8)}…</code>
                      </td>
                      <td>
                        <div className="admin-users__role-badges">
                          {u.roles.map((r) => <RoleBadge key={r} role={r} />)}
                          {u.isWhitelisted && (
                            <span className="admin-users__badge admin-users__badge--whitelist">Whitelisted</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{u.interviewCount ?? 0}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <select
                          value={u.roles[0] ?? 'user'}
                          disabled={updatingRole === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="admin-users__tier-select"
                        >
                          {ROLE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        {updatingRole === u.id && <span className="admin-users__tier-spinner" />}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="admin-users__delete-btn"
                          title="Delete"
                        >
                          <Trash2 aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-users__pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-users__pagination-btn"
                aria-label="Previous page"
              >
                <ChevronLeft aria-hidden />
              </button>
              <span className="admin-users__pagination-text">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="admin-users__pagination-btn"
                aria-label="Next page"
              >
                <ChevronRight aria-hidden />
              </button>
            </div>
          )}
        </div>

        <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-users__back">
          ← Dashboard
        </Link>
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
