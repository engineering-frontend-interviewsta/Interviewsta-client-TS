import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routerConstants';
import Footer from '../components/shared/Footer';

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to={ROUTES.HOME} className="font-semibold text-neutral-800">
            Interviewsta
          </Link>
          <nav className="flex gap-4">
            <Link to={ROUTES.VIDEO_INTERVIEWS_LANDING} className="text-neutral-600 hover:text-neutral-900 text-sm">
              Video interviews
            </Link>
            <Link to={ROUTES.RESUME_LANDING} className="text-neutral-600 hover:text-neutral-900 text-sm">
              Resume
            </Link>
            <Link to={ROUTES.LOGIN} className="text-neutral-600 hover:text-neutral-900 text-sm">
              Log in
            </Link>
            <Link to={ROUTES.SIGNUP} className="text-blue-600 font-medium hover:underline text-sm">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
