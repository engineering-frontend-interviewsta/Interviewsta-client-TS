import { User, Mail, Calendar, Shield, CheckCircle } from 'lucide-react';
import type { LatestSubscriptionResult } from '../../../types/account';

interface Props {
  account: LatestSubscriptionResult;
  displayName: string;
  isWhitelisted?: boolean;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  developer: { label: 'Developer', cls: 'account-tab__badge--developer' },
  admin:     { label: 'Admin',     cls: 'account-tab__badge--admin'     },
  admin_staff:{ label: 'Staff',   cls: 'account-tab__badge--admin'     },
  teacher:   { label: 'Teacher',  cls: 'account-tab__badge--teacher'   },
  student:   { label: 'Student',  cls: 'account-tab__badge--student'   },
  user:      { label: 'User',     cls: 'account-tab__badge--user'      },
};

export default function AccountDetailsTab({ account, displayName, isWhitelisted }: Props) {
  const u = account.user;
  const sub = account.subscription;
  const rawTierName = account.account?.tierName ?? sub?.tierName ?? 'Free';
  // Whitelisted roles (developer/admin) bypass subscriptions — show their actual plan label
  const tierName = isWhitelisted ? (rawTierName === 'Free' ? 'Developer' : rawTierName) : rawTierName;

  const joinDate = u?.dateJoined
    ? new Date(u.dateJoined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="account-tab">
      <h2 className="account-tab__heading">Account Details</h2>

      <div className="account-tab__profile-card">
        <div className="account-tab__avatar-lg" aria-hidden>{initial}</div>
        <div className="account-tab__profile-info">
          <p className="account-tab__profile-name">{displayName}</p>
          <p className="account-tab__profile-email">
            <Mail size={13} aria-hidden />
            {u?.email ?? '—'}
          </p>
          {joinDate && (
            <p className="account-tab__profile-meta">
              <Calendar size={13} aria-hidden />
              Member since {joinDate}
            </p>
          )}
        </div>
      </div>

      <div className="account-tab__grid-2">
        <div className="account-tab__info-card">
          <p className="account-tab__info-label">
            <Shield size={14} aria-hidden />
            Plan
          </p>
          <p className="account-tab__info-value">{tierName}</p>
        </div>

        <div className="account-tab__info-card">
          <p className="account-tab__info-label">
            <CheckCircle size={14} aria-hidden />
            Access status
          </p>
          <p className={`account-tab__info-value ${(account.hasAccess || isWhitelisted) ? 'account-tab__info-value--green' : 'account-tab__info-value--muted'}`}>
            {(account.hasAccess || isWhitelisted) ? 'Active' : 'No active plan'}
          </p>
        </div>

        <div className="account-tab__info-card">
          <p className="account-tab__info-label">
            <User size={14} aria-hidden />
            User ID
          </p>
          <p className="account-tab__info-value account-tab__info-value--mono">{u?.id ?? '—'}</p>
        </div>

        {sub && (
          <div className="account-tab__info-card">
            <p className="account-tab__info-label">Billing cycle</p>
            <p className="account-tab__info-value" style={{ textTransform: 'capitalize' }}>
              {sub.billingInterval}
            </p>
          </div>
        )}
      </div>

      {sub && (
        <div className="account-tab__sub-card">
          <p className="account-tab__sub-title">Current Subscription</p>
          <div className="account-tab__sub-row">
            <span className="account-tab__sub-key">Plan</span>
            <span className="account-tab__sub-val">{sub.tierName}</span>
          </div>
          <div className="account-tab__sub-row">
            <span className="account-tab__sub-key">Status</span>
            <span className={`account-tab__badge ${sub.status === 'active' ? 'account-tab__badge--active' : 'account-tab__badge--inactive'}`}>
              {sub.status}
            </span>
          </div>
          <div className="account-tab__sub-row">
            <span className="account-tab__sub-key">Started</span>
            <span className="account-tab__sub-val">{new Date(sub.startedAt).toLocaleDateString()}</span>
          </div>
          <div className="account-tab__sub-row">
            <span className="account-tab__sub-key">Renews / Expires</span>
            <span className="account-tab__sub-val">{new Date(sub.endsAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
