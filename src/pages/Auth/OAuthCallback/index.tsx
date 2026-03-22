import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routerConstants';
import '../Auth.css';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGithub } = useAuth();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleOAuth = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setProcessing(false);
        setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setProcessing(false);
        setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
        return;
      }

      const role = localStorage.getItem('signup_role') || 'student';
      localStorage.removeItem('signup_role');

      try {
        let result;
        if (state === 'google') {
          result = await loginWithGoogle(code, role);
        } else if (state === 'github') {
          result = await loginWithGithub(code, role);
        } else {
          setError('Invalid OAuth provider');
          setProcessing(false);
          setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
          return;
        }

        const hasRoles = (result.roles?.length ?? 0) > 0 || !!result.role;
        if (result.success && result.user && hasRoles) {
          const hasPhone = !!result.user.phone?.trim();
          const hasCountry = !!result.user.country?.trim();
          if (!hasPhone || !hasCountry) {
            navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
            return;
          }
          const primaryRole = result.roles?.[0] ?? result.role;
          if (primaryRole === 'teacher') {
            navigate(ROUTES.TEACHER_CLASSES, { replace: true });
          } else if (primaryRole === 'admin') {
            navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
          } else {
            navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
          }
        } else {
          setError(result.error ?? 'Authentication failed');
          setProcessing(false);
          setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(`An unexpected error occurred: ${msg}`);
        setProcessing(false);
        setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
      }
    };

    void handleOAuth();
  }, [searchParams, navigate, loginWithGoogle, loginWithGithub]);

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-inner">
        {processing ? (
          <>
            <div className="auth-callback-spinner-wrap" aria-hidden>
              <svg className="auth-callback-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Completing sign in…</h2>
            <p>Please wait while we authenticate your account.</p>
          </>
        ) : (
          <>
            <div className="auth-error-icon" aria-hidden>
              <svg className="auth-error-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2>Authentication failed</h2>
            <p className="auth-callback-error-msg">{error}</p>
            <p className="auth-callback-redirect-hint">Redirecting to login page…</p>
          </>
        )}
      </div>
    </div>
  );
}

