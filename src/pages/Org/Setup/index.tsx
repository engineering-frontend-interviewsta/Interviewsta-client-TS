import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { createOrganization, getOrgSetupStatus } from '../../../services/b2bService';
import '../../B2B/B2B.css';

export default function OrgSetupPage() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getOrgSetupStatus();
        if (!active) return;
        if (response.data.hasOrganization) {
          navigate(ROUTES.ORG_DASHBOARD, { replace: true });
          return;
        }
      } catch {
        // keep user on setup
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!roles?.includes('org_admin')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
  if (checking) return <p className="b2b-loading" style={{ padding: '1.5rem' }}>Loading setup...</p>;

  return (
    <div className="b2b-modal">
      <div className="b2b-modal-card">
        <h1 className="b2b-title">Create organization</h1>
        <p className="b2b-subtitle">Complete this required setup to continue as organization admin.</p>
        <form
          className="b2b-form"
          style={{ marginTop: '1rem' }}
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setCreatedCode('');
            setLoading(true);
            try {
              const response = await createOrganization(name.trim(), code.trim() || undefined);
              setCreatedCode(response.data.code);
              navigate(ROUTES.ORG_DASHBOARD, { replace: true });
            } catch (err: unknown) {
              const message =
                err && typeof err === 'object' && 'response' in err
                  ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                    'Failed to create organization')
                  : 'Failed to create organization';
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="b2b-item-meta">Organization name</label>
            <input
              className="b2b-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme University"
              required
            />
          </div>
          <div>
            <label className="b2b-item-meta">Custom org code (optional)</label>
            <input
              className="b2b-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ACME-2026"
            />
          </div>
          {error ? <p className="b2b-error">{error}</p> : null}
          {createdCode ? (
            <p className="b2b-item-row">Organization created. Org code: {createdCode}</p>
          ) : null}
          <button className="b2b-button" disabled={loading} type="submit">
            {loading ? 'Creating...' : 'Create organization'}
          </button>
        </form>
      </div>
    </div>
  );
}
