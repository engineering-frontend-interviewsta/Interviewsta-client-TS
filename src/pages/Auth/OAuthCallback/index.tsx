import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routerConstants';

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

        if (result.success && result.user && result.role) {
          const hasPhone = !!result.user.phone?.trim();
          const hasCountry = !!result.user.country?.trim();
          if (!hasPhone || !hasCountry) {
            navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
            return;
          }
          if (result.role === 'teacher') {
            navigate(ROUTES.TEACHER_CLASSES, { replace: true });
          } else if (result.role === 'admin') {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        {processing ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Completing sign in…</h2>
            <p className="text-gray-600">Please wait while we authenticate your account.</p>
          </>
        ) : (
          <>
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login page…</p>
          </>
        )}
      </div>
    </div>
  );
}

