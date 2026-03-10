import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routerConstants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectByRole(navigate: (path: string, opts?: { replace: boolean }) => void, role: string | null) {
  if (role === 'teacher') navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
  else if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
  else navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, role, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && role) redirectByRole(navigate, role);
  }, [isLoading, user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(trimmedEmail, password);
      if (!result.success) {
        setError(result.error ?? 'Login failed.');
        return;
      }
      redirectByRole(navigate, result.role ?? null);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google login is not configured.');
      return;
    }
    const redirectUri = `${window.location.origin}${ROUTES.AUTH_CALLBACK}`;
    const scope = 'profile email';
    const googleAuthUrl =
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      'response_type=code&' +
      `scope=${encodeURIComponent(scope)}&` +
      'state=google';
    window.location.href = googleAuthUrl;
  };

  if (isLoading || user) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-neutral-800 mb-6">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 text-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-500 uppercase tracking-wide">or continue with</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-neutral-300 rounded-lg py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <span className="text-lg">G</span>
            <span>Continue with Google</span>
          </button>
        </div>
        <p className="mt-4 text-center text-neutral-600 text-sm">
          Don’t have an account?{' '}
          <Link to={ROUTES.SIGNUP} className="text-blue-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
