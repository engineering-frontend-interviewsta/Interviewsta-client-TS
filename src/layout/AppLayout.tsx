import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInterviewDevMode } from '../context/InterviewDevModeContext';
import { interviewDevToolsAllowedForUser } from '../constants/interviewDevTools';
import { ROUTES } from '../constants/routerConstants';
import LoadingFallback from '../components/shared/LoadingFallback';
import ThemeToggle from '../components/shared/ThemeToggle';
import BrandLogo from '../components/shared/BrandLogo';
import { getOrgSetupStatus } from '../services/b2bService';
import './AppLayout.css';

const HIDE_HEADER_PATHS: string[] = [ROUTES.INTERVIEW_INTERFACE];
const ORG_ADMIN_BLOCKED_PREFIXES: string[] = [
  ROUTES.VIDEO_INTERVIEW,
  ROUTES.LEARNING,
  ROUTES.RESUME_ANALYSIS,
  ROUTES.STUDENT_DASHBOARD,
];

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
  const { devMode, toggleDevMode } = useInterviewDevMode();
  const location = useLocation();
  const navigate = useNavigate();
  const hideHeader = HIDE_HEADER_PATHS.includes(location.pathname);
  const isAdmin = roles?.includes('admin');
  const isOrgAdmin = roles?.includes('org_admin');
  const isTeacher = roles?.includes('teacher');
  const isStudent = roles?.includes('student');
  const primaryRole = roles?.[0] ?? null;
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgSetupChecked, setOrgSetupChecked] = useState(false);
  const [orgSetupDone, setOrgSetupDone] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isOrgAdmin) {
      setOrgSetupChecked(true);
      setOrgSetupDone(true);
      return () => {
        active = false;
      };
    }
    (async () => {
      try {
        const response = await getOrgSetupStatus();
        if (!active) return;
        const done = !!response.data.hasOrganization;
        setOrgSetupDone(done);
        setOrgSetupChecked(true);
        if (!done && location.pathname !== ROUTES.ORG_SETUP) {
          navigate(ROUTES.ORG_SETUP, { replace: true });
          return;
        }
        if (
          done &&
          ORG_ADMIN_BLOCKED_PREFIXES.some(
            (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
          )
        ) {
          navigate(ROUTES.ORG_DASHBOARD, { replace: true });
        }
      } catch {
        if (!active) return;
        setOrgSetupDone(false);
        setOrgSetupChecked(true);
        if (location.pathname !== ROUTES.ORG_SETUP) {
          navigate(ROUTES.ORG_SETUP, { replace: true });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [isOrgAdmin, location.pathname, navigate]);

  if (isLoading) {
    return <LoadingFallback />;
  }
  if (!orgSetupChecked) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const dashboardPath =
    primaryRole === 'admin'
      ? ROUTES.ADMIN_DASHBOARD
      : primaryRole === 'org_admin'
      ? ROUTES.ORG_DASHBOARD
      : primaryRole === 'teacher'
      ? ROUTES.TEACHER_CLASSES
      : primaryRole === 'student'
      ? ROUTES.STUDENT_MY_CLASSES
      : ROUTES.STUDENT_DASHBOARD;
  const canUseOrgAdminMainNav = !isOrgAdmin || orgSetupDone;

  /* Header "Dashboard" nav link goes to student dashboard; admin uses dropdown for Admin. */
  const headerDashboardPath = isAdmin ? ROUTES.STUDENT_DASHBOARD : dashboardPath;

  const displayName = user.displayName ?? user.email ?? 'User';
  const initial = getInitial(user.displayName ?? null, user.email ?? null);

  return (
    <div className="app-layout">
      {!hideHeader && (
        <header className="app-layout__header">
          <div className="app-layout__header-inner">
            <Link
              to={isAdmin ? ROUTES.ADMIN_DASHBOARD : dashboardPath}
              className="app-layout__brand"
            >
              <img src={logoImg} alt="Interviewsta" className="app-layout__brand-logo" />
            </Link>
            <nav className="app-layout__nav">
              {isTeacher ? (
                <Link
                  to={ROUTES.TEACHER_CLASSES}
                  className={`app-layout__nav-link ${
                    location.pathname === ROUTES.TEACHER_CLASSES ? 'app-layout__nav-link--active' : ''
                  }`}
                >
                  My classes
                </Link>
              ) : (
                <>
                  {!isOrgAdmin && (
                    <Link
                      to={headerDashboardPath}
                      className={`app-layout__nav-link ${
                        location.pathname === headerDashboardPath ? 'app-layout__nav-link--active' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                  {isOrgAdmin && canUseOrgAdminMainNav && (
                    <Link
                      to={ROUTES.ORG_DASHBOARD}
                      className={`app-layout__nav-link ${
                        location.pathname === ROUTES.ORG_DASHBOARD ? 'app-layout__nav-link--active' : ''
                      }`}
                    >
                      Organization
                    </Link>
                  )}
                  {isStudent && (
                    <Link
                      to={ROUTES.STUDENT_MY_CLASSES}
                      className={`app-layout__nav-link ${
                        location.pathname === ROUTES.STUDENT_MY_CLASSES ? 'app-layout__nav-link--active' : ''
                      }`}
                    >
                      My classes
                    </Link>
                  )}
                  {!isOrgAdmin && (
                    <>
                      <Link
                        to={ROUTES.VIDEO_INTERVIEW}
                        className={`app-layout__nav-link ${
                          location.pathname === ROUTES.VIDEO_INTERVIEW ? 'app-layout__nav-link--active' : ''
                        }`}
                      >
                        Video interview
                      </Link>
                      <Link
                        to={ROUTES.LEARNING}
                        className={`app-layout__nav-link ${
                          location.pathname === ROUTES.LEARNING ? 'app-layout__nav-link--active' : ''
                        }`}
                      >
                        Learning
                      </Link>
                      <Link
                        to={ROUTES.RESUME_ANALYSIS}
                        className={`app-layout__nav-link ${
                          location.pathname === ROUTES.RESUME_ANALYSIS ? 'app-layout__nav-link--active' : ''
                        }`}
                      >
                        Resume
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        className={`app-layout__nav-link ${
                          location.pathname === ROUTES.ADMIN_DASHBOARD ? 'app-layout__nav-link--active' : ''
                        }`}
                      >
                        Admin
                      </Link>
                      <Link
                        to={ROUTES.ADMIN_USERS}
                        className={`app-layout__nav-link ${
                          location.pathname === ROUTES.ADMIN_USERS ? 'app-layout__nav-link--active' : ''
                        }`}
                      >
                        Users
                      </Link>
                      <Link
                        to={ROUTES.ADMIN_INTERVIEW_THUMBNAILS}
                        className={`app-layout__nav-link ${
                          location.pathname === ROUTES.ADMIN_INTERVIEW_THUMBNAILS
                            ? 'app-layout__nav-link--active'
                            : ''
                        }`}
                      >
                        Thumbnails
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="app-layout__header-right">
              {showInterviewDevToggle && (
                <button
                  type="button"
                  className={`app-layout__dev-toggle${devMode ? ' app-layout__dev-toggle--on' : ''}`}
                  onClick={() => toggleDevMode()}
                  aria-pressed={devMode}
                  title="Dev mode: type replies instead of speaking; AI replies without voice. For local testing only."
                >
                  Dev mode
                </button>
              )}

              <ThemeToggle />

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
                  {isAdmin && (
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
                      <Link
                        to={ROUTES.ADMIN_INTERVIEW_THUMBNAILS}
                        className="app-layout__user-item"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ImageIcon size={18} strokeWidth={2} aria-hidden />
                        <span>Thumbnails</span>
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
          </div>
        </header>
      )}
      <main className={`app-layout__main${hideHeader ? '' : ' app-layout__main--padded'}`}>
        <Outlet />
      </main>
    </div>
  );
}
