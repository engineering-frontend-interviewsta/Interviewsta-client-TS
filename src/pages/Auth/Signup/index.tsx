import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routerConstants';
import { VALIDATION } from '../../../constants/appConstants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && role) {
      if (role === 'teacher') navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
      else if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      else navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    }
  }, [isLoading, user, role, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    role: 'student' as string,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleChange = (field: string, value: string) => {
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
        formData.role,
        formData.phone?.trim() ?? '',
        formData.country?.trim() ?? ''
      );
      if (!result.success) {
        setError(result.error ?? 'Registration failed.');
        return;
      }
      navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-neutral-800 mb-6">Sign up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="signup-first" className="block text-sm font-medium text-neutral-700 mb-1">
                First name
              </label>
              <input
                id="signup-first"
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="signup-last" className="block text-sm font-medium text-neutral-700 mb-1">
                Last name
              </label>
              <input
                id="signup-last"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="signup-role" className="block text-sm font-medium text-neutral-700 mb-1">
              Role
            </label>
            <select
              id="signup-role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={`At least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`}
            />
          </div>
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat password"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-sm text-neutral-600 hover:text-neutral-800"
          >
            {showPassword ? 'Hide' : 'Show'} passwords
          </button>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-neutral-600 text-sm">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
