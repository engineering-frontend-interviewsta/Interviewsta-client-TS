import { Link } from 'react-router-dom';
import { LayoutDashboard, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  displayName: string | null;
}

export default function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__text">
        <div className="dashboard-header__title-row">
          <span className="dashboard-header__icon" aria-hidden>
            <LayoutDashboard />
          </span>
          <h1 className="dashboard-header__title">
            Welcome back, {displayName || 'User'}!
          </h1>
        </div>
        <p className="dashboard-header__subtitle">
          Here&apos;s your interview preparation progress and next steps.
        </p>
      </div>
      <Link to={ROUTES.VIDEO_INTERVIEW} className="dashboard-header__cta">
        Start interview
        <span className="dashboard-header__cta-icon" aria-hidden>
          <ChevronRight size={18} strokeWidth={2} />
        </span>
      </Link>
    </header>
  );
}
