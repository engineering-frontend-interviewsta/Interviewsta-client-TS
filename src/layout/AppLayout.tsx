import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routerConstants';
import LoadingFallback from '../components/shared/LoadingFallback';

const HIDE_HEADER_PATHS: string[] = [ROUTES.INTERVIEW_INTERFACE];

export default function AppLayout() {
  const { user, isLoading, role, logout } = useAuth();
  const location = useLocation();
  const hideHeader = HIDE_HEADER_PATHS.includes(location.pathname);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to={
              role === 'admin'
                ? ROUTES.ADMIN_DASHBOARD
                : role === 'teacher'
                  ? ROUTES.TEACHER_DASHBOARD
                  : ROUTES.STUDENT_DASHBOARD
            }
            className="font-semibold text-neutral-800"
          >
            Interviewsta
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {role === 'teacher' ? (
              <Link to={ROUTES.TEACHER_DASHBOARD} className="text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
            ) : (
              <Link to={ROUTES.STUDENT_DASHBOARD} className="text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
            )}
            <Link to={ROUTES.VIDEO_INTERVIEW} className="text-neutral-600 hover:text-neutral-900">
              Video interview
            </Link>
            <Link to={ROUTES.LEARNING} className="text-neutral-600 hover:text-neutral-900">
              Learning
            </Link>
            <Link to={ROUTES.RESUME_ANALYSIS} className="text-neutral-600 hover:text-neutral-900">
              Resume
            </Link>
            {role === 'teacher' && (
              <Link to={ROUTES.TEACHER_CLASSES} className="text-neutral-600 hover:text-neutral-900">
                Classes
              </Link>
            )}
            {role === 'admin' && (
              <>
                <Link to={ROUTES.ADMIN_DASHBOARD} className="text-neutral-600 hover:text-neutral-900">
                  Admin
                </Link>
                <Link to={ROUTES.ADMIN_USERS} className="text-neutral-600 hover:text-neutral-900">
                  Users
                </Link>
              </>
            )}
            <Link to={ROUTES.ACCOUNT} className="text-neutral-600 hover:text-neutral-900">
              Account
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-neutral-600 hover:text-neutral-900"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      )}
      <main className={hideHeader ? 'flex-1 flex flex-col min-h-0' : 'flex-1 p-4'}>
        <Outlet />
      </main>
    </div>
  );
}
