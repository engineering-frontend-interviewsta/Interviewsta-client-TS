import { Terminal, Zap } from 'lucide-react';

export default function DeveloperTab() {
  return (
    <div className="account-tab">
      <h2 className="account-tab__heading">Developer</h2>

      <div className="account-tab__dev-badge-row">
        <span className="account-tab__badge account-tab__badge--developer">
          <Zap size={12} aria-hidden />
          Developer Access
        </span>
        <span className="account-tab__badge account-tab__badge--active">Unlimited credits</span>
      </div>

      {/* API key UI — restore imports (Copy, Eye, EyeOff) and state when wiring a real key. */}

      <div className="account-tab__dev-section">
        <p className="account-tab__dev-section-title">
          <Terminal size={15} aria-hidden />
          Usage Logs
        </p>
        <div className="account-tab__dev-log-placeholder">
          <p className="account-tab__empty">Usage log viewer coming soon.</p>
        </div>
      </div>

      <div className="account-tab__dev-section">
        <p className="account-tab__dev-section-title">Permissions</p>
        <ul className="account-tab__dev-perms">
          {[
            'Bypass credit checks',
            'Unlimited interview sessions',
            'Unlimited resume analyses',
            'Access to all interview types',
            'Internal API access',
          ].map((p) => (
            <li key={p} className="account-tab__dev-perm-item">
              <span className="account-tab__dev-perm-dot" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
