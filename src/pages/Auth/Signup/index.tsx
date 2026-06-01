import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routerConstants';
import { VALIDATION } from '../../../constants/appConstants';
import AuthShell from '../AuthShell';
import '../Auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { user, roles, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && roles) {
      if (roles.includes('admin')) navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      else if (roles.includes('org_admin')) navigate(ROUTES.ORG_SETUP, { replace: true });
      else if (roles.includes('teacher')) navigate(ROUTES.TEACHER_ONBOARDING, { replace: true });
      else if (roles.includes('student')) navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      else navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    }
  }, [isLoading, user, roles, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    roles: ['user'] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    if (!name) {
      setError('First and last name are required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await register(
        name,
        formData.email.trim(),
        formData.password,
        formData.roles,
        formData.phone?.trim() ?? '',
        formData.country?.trim() ?? ''
      );
      if (!result.success) {
        setError(result.error ?? 'Registration failed.');
        return;
      }
      const primaryRole = result.roles?.[0] ?? result.role;
      if (primaryRole === 'admin') navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      else if (primaryRole === 'org_admin') navigate(ROUTES.ORG_SETUP, { replace: true });
      else if (primaryRole === 'teacher') navigate(ROUTES.TEACHER_ONBOARDING, { replace: true });
      else if (primaryRole === 'student') navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      else navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user) return null;

  return (
    <AuthShell wide>
      <h1 className="auth-title">Create account</h1>
      <p className="auth-subtitle auth-subtitle--tight">Join Interviewsta to practice and improve.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-fields-row">
          <div className="auth-field">
            <label htmlFor="signup-first" className="auth-label">
              First name
            </label>
            <input
              id="signup-first"
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="auth-input"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-last" className="auth-label">
              Last name
            </label>
            <input
              id="signup-last"
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="auth-input"
            />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="signup-role" className="auth-label">
            Role
          </label>
          <select
            id="signup-role"
            value={formData.roles[0]}
            onChange={(e) => handleChange('roles', [e.target.value])}
            className="auth-select"
          >
            <option value="user">User</option>
            {/* <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="org_admin">Organization admin</option>
            <option value="admin">Admin</option>
          */}</select>
        </div>
        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">
            Password
          </label>
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="auth-input"
            placeholder={`At least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="signup-confirm" className="auth-label">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="auth-input"
            placeholder="Repeat password"
          />
        </div>
        <div className="auth-toggle-wrap">
          <button type="button" onClick={() => setShowPassword((p) => !p)} className="auth-toggle-btn">
            {showPassword ? 'Hide' : 'Show'} passwords
          </button>
        </div>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to={ROUTES.LOGIN} className="auth-link">Log in</Link>
      </p>
    </AuthShell>
  );
}
