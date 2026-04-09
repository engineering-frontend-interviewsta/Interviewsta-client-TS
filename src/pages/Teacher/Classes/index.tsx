import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { createTeacherClass, getTeacherClasses, type TeacherClass } from '../../../services/b2bService';
import '../../B2B/B2B.css';
import './TeacherClasses.css';

export default function TeacherClassesPage() {
  const { roles } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    const response = await getTeacherClasses();
    setClasses(response.data);
  };

  useEffect(() => {
    void load();
  }, []);

  if (!roles?.includes('teacher')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const byStudents = (b.studentCount ?? 0) - (a.studentCount ?? 0);
      if (byStudents !== 0) return byStudents;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [classes]);

  return (
    <div className="b2b-page b2b-page--full">
      <div className="b2b-header">
        <div className="teacher-classes__header">
          <div>
            <h1 className="b2b-title">My classes</h1>
            <p className="b2b-subtitle">Create a class, share the code, and track student progress.</p>
          </div>
          <button
            type="button"
            className="b2b-button teacher-classes__create"
            onClick={() => {
              setError('');
              setCreateOpen(true);
              setTimeout(() => initialFocusRef.current?.focus(), 0);
            }}
          >
            + Create class
          </button>
        </div>
      </div>

      <section className="b2b-section">
        <div className="teacher-classes__section-head">
          <h2 className="b2b-section-title">Your classes</h2>
          <p className="teacher-classes__hint">Tip: students join using the class code.</p>
        </div>

        <div className="teacher-classes__cards">
          {sortedClasses.map((item) => (
            <div key={item.classId} className="teacher-classes__card">
              <div className="teacher-classes__card-top">
                <div className="teacher-classes__card-titlewrap">
                  <h3 className="teacher-classes__card-title">{item.name}</h3>
                  {item.description ? (
                    <p className="teacher-classes__card-desc">{item.description}</p>
                  ) : (
                    <p className="teacher-classes__card-desc teacher-classes__card-desc--muted">
                      No description added.
                    </p>
                  )}
                </div>
                <div className="teacher-classes__code">
                  <span className="teacher-classes__code-label">Code</span>
                  <span className="teacher-classes__code-value">{item.code}</span>
                </div>
              </div>

              <div className="teacher-classes__card-bottom">
                <div className="teacher-classes__stat">
                  <span className="teacher-classes__stat-label">Students</span>
                  <span className="teacher-classes__stat-value">{item.studentCount ?? 0}</span>
                </div>
                <Link className="teacher-classes__details" to={`/teacher/classes/${item.classId}`}>
                  View details →
                </Link>
              </div>
            </div>
          ))}

          {classes.length === 0 ? (
            <div className="teacher-classes__empty">
              <p className="b2b-empty" style={{ margin: 0 }}>
                No classes yet.
              </p>
              <button
                type="button"
                className="b2b-button"
                onClick={() => {
                  setError('');
                  setCreateOpen(true);
                  setTimeout(() => initialFocusRef.current?.focus(), 0);
                }}
              >
                Create your first class
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {createOpen ? (
        <div
          className="b2b-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Create a new class"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setCreateOpen(false);
          }}
        >
          <div className="b2b-modal-card">
            <div className="teacher-classes__modal-head">
              <div>
                <h2 className="teacher-classes__modal-title">Create class</h2>
                <p className="teacher-classes__modal-subtitle">A code will be generated for students to join.</p>
              </div>
              <button
                type="button"
                className="teacher-classes__modal-close"
                onClick={() => setCreateOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              className="b2b-form teacher-classes__modal-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setLoading(true);
                try {
                  await createTeacherClass(name.trim(), description.trim());
                  setName('');
                  setDescription('');
                  setCreateOpen(false);
                  await load();
                } catch (err: unknown) {
                  const message =
                    err && typeof err === 'object' && 'response' in err
                      ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                        'Failed to create class')
                      : 'Failed to create class';
                  setError(message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label className="teacher-classes__field">
                <span className="teacher-classes__label">Class name</span>
                <input
                  ref={initialFocusRef}
                  className="b2b-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Placement — Batch A"
                  required
                />
              </label>
              <label className="teacher-classes__field">
                <span className="teacher-classes__label">Description (optional)</span>
                <textarea
                  className="b2b-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this class for?"
                />
              </label>

              {error ? <p className="b2b-error">{error}</p> : null}

              <div className="teacher-classes__modal-actions">
                <button type="button" className="teacher-classes__secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </button>
                <button className="b2b-button" disabled={loading} type="submit">
                  {loading ? 'Creating...' : 'Create class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
