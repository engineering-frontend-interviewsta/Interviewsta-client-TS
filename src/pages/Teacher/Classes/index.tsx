import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherClasses } from '../../../services/teacherService';
import { ROUTES } from '../../../constants/routerConstants';
import type { ClassItem } from '../../../types/student';
import LoadingFallback from '../../../components/shared/LoadingFallback';
import './TeacherClasses.css';

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
    <div className="teacher-classes">
      <div className="teacher-classes__inner">
        <h1 className="teacher-classes__title">My Classes</h1>
        <p className="teacher-classes__subtitle">Manage your classes and view students.</p>
        {error && <div className="teacher-classes__error" role="alert">{error}</div>}
        {classes.length === 0 && !error ? (
          <p className="teacher-classes__empty">No classes yet.</p>
        ) : (
          <ul className="teacher-classes__list">
            {classes.map((c) => (
              <li key={c.id} className="teacher-classes__card">
                <span className="teacher-classes__card-name">{c.name ?? `Class ${c.id}`}</span>
                <span className="teacher-classes__card-code">{c.code ?? c.join_code ?? ''}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to={ROUTES.DASHBOARD} className="teacher-classes__back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
