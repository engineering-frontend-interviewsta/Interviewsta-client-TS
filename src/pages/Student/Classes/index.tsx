import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentClasses, joinClass } from '../../../services/studentService';
import { ROUTES } from '../../../constants/routerConstants';
import type { ClassItem } from '../../../types/student';
import LoadingFallback from '../../../components/shared/LoadingFallback';

export default function StudentClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const load = () => {
    setLoading(true);
    getStudentClasses()
      .then(setClasses)
      .catch(() => setError('Failed to load classes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await joinClass(joinCode.trim());
      setJoinCode('');
      load();
    } catch {
      setJoinError('Invalid or expired code. Try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading && classes.length === 0) return <LoadingFallback />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-gray-600 mb-6">Enrolled classes. Join with a code from your teacher.</p>
        <form onSubmit={handleJoin} className="flex gap-2 mb-6">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value); setJoinError(''); }}
            placeholder="Enter class code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={joining}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {joining ? 'Joining…' : 'Join'}
          </button>
        </form>
        {joinError && <p className="text-sm text-red-600 mb-4">{joinError}</p>}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        {classes.length === 0 && !error ? (
          <p className="text-gray-500 mb-6">You are not in any class yet.</p>
        ) : (
          <ul className="space-y-3 mb-6">
            {classes.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <span className="font-medium text-gray-900">{c.name ?? `Class ${c.id}`}</span>
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
