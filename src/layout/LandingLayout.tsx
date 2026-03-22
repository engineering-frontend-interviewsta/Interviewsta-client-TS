import { Outlet } from 'react-router-dom';
import ScrollToTop from '../landing/ScrollToTop';
import LandingHeader from '../landing/LandingHeader';
import LegacyLandingFooter from '../landing/Footer';
import './LandingLayout.css';

/**
 * Marketing shell: same structure as legacy interviewsta-landing-website
 * (LandingHeader + page content + Footer).
 */
export default function LandingLayout() {
  return (
    <div className="landing-layout">
      <ScrollToTop />
      <LandingHeader />
      <main className="landing-layout__main">
        <Outlet />
      </main>
      <LegacyLandingFooter />
    </div>
  );
}
