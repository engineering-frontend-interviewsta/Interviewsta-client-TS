import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../services/authService';
import { ROUTES } from '../../../constants/routerConstants';
import AuthShell from '../AuthShell';
import '../Auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(trimmed, window.location.origin);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="auth-success">
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            If an account exists for {email}, we sent a password reset link.
          </p>
          <Link to={ROUTES.LOGIN} className="auth-link auth-link--inline">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="auth-title">Forgot password</h1>
      <p className="auth-subtitle auth-subtitle--tight">Enter your email and we’ll send a reset link.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="fp-email" className="auth-label">
            Email
          </label>
          <input
            id="fp-email"
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
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="auth-btn-primary">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="auth-footer">
        <Link to={ROUTES.LOGIN} className="auth-link">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
