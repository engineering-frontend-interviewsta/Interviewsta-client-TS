import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getStudentClasses, studentJoinClass, type TeacherClass } from '../../../services/b2bService';
import '../../B2B/B2B.css';
import './StudentMyClasses.css';

export default function StudentMyClassesPage() {
  const { roles } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    const response = await getStudentClasses();
    setClasses(response.data);
  };

  useEffect(() => {
    void load();
  }, []);

  if (!roles?.includes('student')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="b2b-page b2b-page--full">
      <div className="b2b-header">
        <div className="smc-header">
          <div>
            <h1 className="b2b-title">My classes</h1>
            <p className="b2b-subtitle">Join a class using a code from your teacher.</p>
          </div>
        </div>
      </div>

      <section className="b2b-section">
        <h2 className="b2b-section-title">Join a class</h2>
        <form
          className="smc-join-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              await studentJoinClass(classCode.trim().toUpperCase());
              setClassCode('');
              await load();
            } catch (err: unknown) {
              const message =
                err && typeof err === 'object' && 'response' in err
                  ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                    'Failed to join class')
                  : 'Failed to join class';
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <input
            ref={inputRef}
            className="b2b-input smc-join-input"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="ENTER CLASS JOIN CODE"
            required
          />
          <button className="b2b-button" disabled={loading} type="submit">
            {loading ? 'Joining...' : 'Join class'}
          </button>
        </form>
        {error ? <p className="b2b-error">{error}</p> : null}
      </section>

      <section className="b2b-section">
        <div className="smc-section-head">
          <h2 className="b2b-section-title">Your classes</h2>
          <p className="smc-hint">{classes.length} enrolled</p>
        </div>

        <div className="smc-cards">
          {classes.map((item) => (
            <Link
              key={item.classId}
              to={`/student/classes/${item.classId}`}
              className="smc-card"
            >
              <div className="smc-card__top">
                <div className="smc-card__titlewrap">
                  <h3 className="smc-card__title">{item.name}</h3>
                  {item.description ? (
                    <p className="smc-card__desc">{item.description}</p>
                  ) : (
                    <p className="smc-card__desc smc-card__desc--muted">No description added.</p>
                  )}
                </div>
                <div className="smc-code">
                  <span className="smc-code__label">Code</span>
                  <span className="smc-code__value">{item.code}</span>
                </div>
              </div>
              <div className="smc-card__footer">
                <span className="smc-open">View class →</span>
              </div>
            </Link>
          ))}

          {classes.length === 0 ? (
            <div className="smc-empty">
              <p className="b2b-empty" style={{ margin: 0 }}>
                You haven't joined any class yet. Enter a code above to get started.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
