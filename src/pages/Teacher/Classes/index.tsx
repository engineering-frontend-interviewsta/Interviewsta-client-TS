import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherClasses } from '../../../services/teacherService';
import { ROUTES } from '../../../constants/routerConstants';
import type { ClassItem } from '../../../types/student';
import LoadingFallback from '../../../components/shared/LoadingFallback';

export default function TeacherClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeacherClasses()
      .then(setClasses)
      .catch(() => setError('Failed to load classes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingFallback />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-gray-600 mb-6">Manage your classes and view students.</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {classes.length === 0 && !error ? (
          <p className="text-gray-500 mb-6">No classes yet.</p>
        ) : (
          <ul className="space-y-3 mb-6">
            {classes.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{c.name ?? `Class ${c.id}`}</span>
                <span className="text-sm text-gray-500">{c.code ?? c.join_code ?? ''}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
