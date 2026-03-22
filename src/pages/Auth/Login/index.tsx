import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routerConstants';
import AuthShell from '../AuthShell';
import '../Auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectByRole(navigate: (path: string, opts?: { replace: boolean }) => void, role: string | null) {
  if (role === 'teacher') navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
  else if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
  else {
    navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
  }
}

function GoogleIcon() {
  return (
    <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, roles, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && roles?.length) redirectByRole(navigate, roles[0] ?? null);
  }, [isLoading, user, roles, navigate]);

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
      redirectByRole(navigate, result.roles?.[0] ?? result.role ?? null);
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
    <AuthShell>
      <h1 className="auth-title">Log in</h1>
      <p className="auth-subtitle auth-subtitle--tight">Welcome back. Sign in to continue.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">
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
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="login-password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="auth-input"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="auth-toggle-password"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <div className="auth-password-row">
          <Link to={ROUTES.FORGOT_PASSWORD} className="auth-link">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="auth-divider">
        <span className="auth-divider-line" aria-hidden />
        <span className="auth-divider-text">or continue with</span>
        <span className="auth-divider-line" aria-hidden />
      </div>
      <button type="button" onClick={handleGoogleSignIn} className="auth-btn-secondary">
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>
      <p className="auth-footer">
        Don’t have an account? <Link to={ROUTES.SIGNUP} className="auth-link">Sign up</Link>
      </p>
    </AuthShell>
  );
}
