import { useState } from 'react';
import { Copy, Eye, EyeOff, Terminal, Zap } from 'lucide-react';

export default function DeveloperTab() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const placeholderKey = 'dev_sk_••••••••••••••••••••••••••••••••';
  const visibleKey = 'dev_sk_internal_access_placeholder_key';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(visibleKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

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

      {/* <div className="account-tab__dev-section">
        <p className="account-tab__dev-section-title">
          <Terminal size={15} aria-hidden />
          API Key
        </p>
        <div className="account-tab__api-key-row">
          <code className="account-tab__api-key-value">
            {showKey ? visibleKey : placeholderKey}
          </code>
          <button
            type="button"
            className="account-tab__icon-btn"
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
          <button
            type="button"
            className="account-tab__icon-btn"
            onClick={handleCopy}
            aria-label="Copy API key"
          >
            <Copy size={16} aria-hidden />
          </button>
          {copied && <span className="account-tab__copied-toast">Copied!</span>}
        </div>
        <p className="account-tab__dev-note">
          Keep your API key secret. Do not expose it in client-side code or public repositories.
        </p>
      </div> */}

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
