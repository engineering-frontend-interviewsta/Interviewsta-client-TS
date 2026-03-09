import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../../../services/adminService';
import { ROUTES } from '../../../constants/routerConstants';
import LoadingFallback from '../../../components/shared/LoadingFallback';

export default function AdminDashboard() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingFallback />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview and metrics.</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {data != null && typeof data === 'object' ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
            <pre className="text-xs text-gray-600 overflow-auto max-h-64">
              {JSON.stringify(data as object, null, 2)}
            </pre>
          </div>
        ) : null}
        <div className="flex gap-4">
          <Link to={ROUTES.ADMIN_USERS} className="text-blue-600 hover:underline">
            User management
          </Link>
          <Link to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
