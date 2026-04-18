import { useState, useEffect } from 'react';
import { getStudentClasses, joinClass } from '../../../services/studentService';
import { ROUTES } from '../../../constants/routerConstants';
import type { ClassItem } from '../../../types/student';
import LoadingFallback from '../../../components/shared/LoadingFallback';
import AppStickyBackBar from '../../../components/shared/AppStickyBackBar';
import './StudentClasses.css';

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
    <div className="student-classes">
      <div className="student-classes__inner">
        <AppStickyBackBar to={ROUTES.DASHBOARD}>Back to Dashboard</AppStickyBackBar>
        <h1 className="student-classes__title">My Classes</h1>
        <p className="student-classes__subtitle">Enrolled classes. Join with a code from your teacher.</p>
        <form onSubmit={handleJoin} className="student-classes__join-form">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value); setJoinError(''); }}
            placeholder="Enter class code"
            className="student-classes__join-input"
          />
          <button type="submit" disabled={joining} className="student-classes__join-btn">
            {joining ? 'Joining…' : 'Join'}
          </button>
        </form>
        {joinError && <p className="student-classes__join-error" role="alert">{joinError}</p>}
        {error && <div className="student-classes__error" role="alert">{error}</div>}
        {classes.length === 0 && !error ? (
          <p className="student-classes__empty">You are not in any class yet.</p>
        ) : (
          <ul className="student-classes__list">
            {classes.map((c) => (
              <li key={c.id} className="student-classes__card">
                <span className="student-classes__card-name">{c.name ?? `Class ${c.id}`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
