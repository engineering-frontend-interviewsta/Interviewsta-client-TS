import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';

/**
 * Landing/marketing dashboard page (public /dashboard route on landing).
 * Authenticated app dashboard is at ROUTES.DASHBOARD (/manage).
 */
export default function LandingDashboard() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Dashboard overview</h1>
        <p className="text-neutral-600 mb-8">
          Explore video interviews, resume analysis, and your learning progress. Sign in to access your dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to={ROUTES.LOGIN}
            className="px-6 py-3 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-100"
          >
            Log in
          </Link>
          <Link
            to={ROUTES.SIGNUP}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
