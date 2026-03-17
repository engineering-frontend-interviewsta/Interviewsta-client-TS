import { useState, useRef, useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  BookOpen,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routerConstants';
import LoadingFallback from '../components/shared/LoadingFallback';
import './AppLayout.css';

const HIDE_HEADER_PATHS: string[] = [ROUTES.INTERVIEW_INTERFACE];

function getInitial(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

export default function AppLayout() {
  const { user, isLoading, roles, logout } = useAuth();
  const location = useLocation();
  const hideHeader = HIDE_HEADER_PATHS.includes(location.pathname);
  const isAdmin = roles?.includes('admin');
  const isTeacher = roles?.includes('teacher');

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const dashboardPath =
    role === 'admin'
      ? ROUTES.ADMIN_DASHBOARD
      : role === 'teacher'
        ? ROUTES.TEACHER_DASHBOARD
        : ROUTES.STUDENT_DASHBOARD;

  /* Header "Dashboard" nav link goes to student dashboard; admin uses dropdown for Admin. */
  const headerDashboardPath = role === 'admin' ? ROUTES.STUDENT_DASHBOARD : dashboardPath;

  const displayName = user.displayName ?? user.email ?? 'User';
  const initial = getInitial(user.displayName ?? null, user.email ?? null);

  return (
    <div className="app-layout">
      {!hideHeader && (
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to={
              isAdmin
                ? ROUTES.ADMIN_DASHBOARD
                : isTeacher
                  ? ROUTES.TEACHER_DASHBOARD
                  : ROUTES.STUDENT_DASHBOARD
            }
            className="font-semibold text-neutral-800"
          >
            Interviewsta
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {isTeacher ? (
              <Link to={ROUTES.TEACHER_DASHBOARD} className="text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
              <Link
                to={ROUTES.VIDEO_INTERVIEW}
                className={`app-layout__nav-link ${location.pathname === ROUTES.VIDEO_INTERVIEW ? 'app-layout__nav-link--active' : ''}`}
              >
                <Video size={18} strokeWidth={2} aria-hidden />
                <span>Video interview</span>
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
            {isTeacher && (
              <Link to={ROUTES.TEACHER_CLASSES} className="text-neutral-600 hover:text-neutral-900">
                Classes
              </Link>
            )}
            {isAdmin && (
              <>
                <Link to={ROUTES.ADMIN_DASHBOARD} className="text-neutral-600 hover:text-neutral-900">
                  Admin
                </Link>
                <Link to={ROUTES.ADMIN_USERS} className="text-neutral-600 hover:text-neutral-900">
                  Users
                </Link>
              )}
            </nav>

            <div className="app-layout__user" ref={userMenuRef}>
              <button
                type="button"
                className="app-layout__user-trigger"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Open account menu"
              >
                <span className="app-layout__user-avatar" aria-hidden>
                  {initial}
                </span>
                <span className="app-layout__user-name">{displayName}</span>
                <ChevronDown
                  size={16}
                  className={`app-layout__user-chevron ${userMenuOpen ? 'app-layout__user-chevron--open' : ''}`}
                  aria-hidden
                />
              </button>

              {userMenuOpen && (
                <div
                  className="app-layout__user-dropdown"
                  role="menu"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setUserMenuOpen(false);
                  }}
                >
                  {role === 'admin' && (
                    <>
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        className="app-layout__user-item"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={18} strokeWidth={2} aria-hidden />
                        <span>Admin</span>
                      </Link>
                      <Link
                        to={ROUTES.ADMIN_USERS}
                        className="app-layout__user-item"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Users size={18} strokeWidth={2} aria-hidden />
                        <span>Users</span>
                      </Link>
                    </>
                  )}
                  <Link
                    to={ROUTES.ACCOUNT}
                    className="app-layout__user-item"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={18} strokeWidth={2} aria-hidden />
                    <span>Account</span>
                  </Link>
                  <div className="app-layout__user-divider" role="separator" />
                  <button
                    type="button"
                    className="app-layout__user-item app-layout__user-item--danger"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      void logout();
                    }}
                  >
                    <LogOut size={18} strokeWidth={2} aria-hidden />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <main className={`app-layout__main${hideHeader ? '' : ' app-layout__main--padded'}`}>
        <Outlet />
      </main>
    </div>
  );
}
