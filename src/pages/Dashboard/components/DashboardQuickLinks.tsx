import { Link } from 'react-router-dom';
import { Zap, Video, BookOpen, FileText, User } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';
import './DashboardQuickLinks.css';

const links = [
  { to: ROUTES.VIDEO_INTERVIEW, icon: Video, label: 'Video interview', description: 'Practice with AI' },
  { to: ROUTES.LEARNING, icon: BookOpen, label: 'Learning', description: 'Concepts & practice' },
  { to: ROUTES.RESUME_ANALYSIS, icon: FileText, label: 'Resume analysis', description: 'Upload & analyze' },
  { to: ROUTES.ACCOUNT, icon: User, label: 'Account', description: 'Settings & billing' },
];

export default function DashboardQuickLinks() {
  return (
    <section className="dashboard-quick-links" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="dashboard-quick-links__title">
        <span className="dashboard-quick-links__title-icon" aria-hidden>
          <Zap />
        </span>
        Quick actions
      </h2>
      <div className="dashboard-quick-links__grid">
        {links.map(({ to, icon: Icon, label, description }) => (
          <Link key={to} to={to} className="dashboard-quick-links__card">
            <span className="dashboard-quick-links__accent" aria-hidden />
            <div className="dashboard-quick-links__body">
              <span className="dashboard-quick-links__icon" aria-hidden>
                <Icon strokeWidth={2} />
              </span>
              <span className="dashboard-quick-links__label">{label}</span>
              <span className="dashboard-quick-links__description">{description}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
