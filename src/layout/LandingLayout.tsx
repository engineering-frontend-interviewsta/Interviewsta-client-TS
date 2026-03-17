import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routerConstants';
import Footer from '../components/shared/Footer';
import './LandingLayout.css';

export default function LandingLayout() {
  return (
    <div className="landing-layout">
      <header className="landing-layout__header">
        <div className="landing-layout__header-inner">
          <Link to={ROUTES.HOME} className="landing-layout__brand">
            Interviewsta
          </Link>
          <nav className="landing-layout__nav">
            <Link to={ROUTES.VIDEO_INTERVIEWS_LANDING} className="landing-layout__nav-link">
              Video interviews
            </Link>
            <Link to={ROUTES.RESUME_LANDING} className="landing-layout__nav-link">
              Resume
            </Link>
            <Link to={ROUTES.LOGIN} className="landing-layout__nav-link">
              Log in
            </Link>
            <Link to={ROUTES.SIGNUP} className="landing-layout__nav-link landing-layout__nav-link--cta">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="landing-layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
