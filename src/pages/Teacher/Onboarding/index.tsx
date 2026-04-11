import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getTeacherOrganization, teacherJoinOrganization } from '../../../services/b2bService';
import '../../B2B/B2B.css';

export default function TeacherOnboardingPage() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const [orgCode, setOrgCode] = useState('');
  const [status, setStatus] = useState<'checking' | 'idle'>('checking');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await getTeacherOrganization();
        if (active) navigate(ROUTES.TEACHER_CLASSES, { replace: true });
      } catch {
        if (active) setStatus('idle');
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!roles?.includes('teacher')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
  if (status === 'checking') return <p className="b2b-loading" style={{ padding: '1.5rem' }}>Checking organization...</p>;

  return (
    <div className="b2b-page b2b-page--full">
      <div className="b2b-header">
        <h1 className="b2b-title">Join your organization</h1>
        <p className="b2b-subtitle">Enter org code shared by your organization admin.</p>
      </div>
      <form
        className="b2b-form-card b2b-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setLoading(true);
          try {
            await teacherJoinOrganization(orgCode.trim().toUpperCase());
            navigate(ROUTES.TEACHER_CLASSES, { replace: true });
          } catch (err: unknown) {
            const message =
              err && typeof err === 'object' && 'response' in err
                ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                  'Failed to join organization')
                : 'Failed to join organization';
            setError(message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label className="b2b-item-meta">Org code</label>
          <input
            className="b2b-input"
            value={orgCode}
            onChange={(e) => setOrgCode(e.target.value)}
            placeholder="ACME-2026"
            required
          />
        </div>
        {error ? <p className="b2b-error">{error}</p> : null}
        <button className="b2b-button" disabled={loading} type="submit">
          {loading ? 'Joining...' : 'Join organization'}
        </button>
      </form>
    </div>
  );
}
