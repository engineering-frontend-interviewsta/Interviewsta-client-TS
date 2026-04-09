import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../../components/shared/BrandLogo';
import { ROUTES } from '../../constants/routerConstants';

type AuthShellProps = {
  children: ReactNode;
  /** Wider card for longer forms (e.g. signup). */
  wide?: boolean;
};

/** Logo + bordered card; used on login, signup, forgot password. */
export default function AuthShell({ children, wide }: AuthShellProps) {
  return (
    <div className="auth-page">
      <div className={`auth-card auth-card--elevated${wide ? ' auth-card--wide' : ''}`}>
        <Link to={ROUTES.HOME} className="auth-logo-link" aria-label="Interviewsta home">
          <BrandLogo alt="" className="auth-logo" />
        </Link>
        {children}
      </div>
    </div>
  );
}
