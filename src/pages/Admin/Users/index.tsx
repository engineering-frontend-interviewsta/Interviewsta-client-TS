import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers } from '../../../services/adminService';
import { ROUTES } from '../../../constants/routerConstants';
import LoadingFallback from '../../../components/shared/LoadingFallback';

export default function AdminUsers() {
  const [users, setUsers] = useState<unknown[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminUsers(page)
      .then((res) => setUsers(res.results ?? []))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && users.length === 0) return <LoadingFallback />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600 mb-6">View and manage users.</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {users.length === 0 && !error ? (
          <p className="text-gray-500 mb-6">No users.</p>
        ) : (
          <ul className="space-y-2 mb-6">
            {users.map((u: unknown, i: number) => (
              <li
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700"
              >
                {typeof u === 'object' && u !== null && 'email' in u
                  ? String((u as { email?: string }).email)
                  : JSON.stringify(u)}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={users.length === 0}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="mt-6">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="text-blue-600 hover:underline">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
