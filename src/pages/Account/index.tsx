import { useCallback, useEffect, useMemo, useState } from 'react';
import { User, Zap, CreditCard, Settings, Terminal, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBillingAccount, getFeedbackAccess } from '../../services/accountService';
import type { LatestSubscriptionResult } from '../../types/account';
import AccountDetailsTab from './tabs/AccountDetailsTab';
import UsageCreditsTab from './tabs/UsageCreditsTab';
import BillingPaymentsTab from './tabs/BillingPaymentsTab';
import SettingsTab from './tabs/SettingsTab';
import DeveloperTab from './tabs/DeveloperTab';
import './Account.css';

type TabId = 'account' | 'usage' | 'billing' | 'settings' | 'developer';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' }>;
  devOnly?: boolean;
}

const TABS: TabDef[] = [
  { id: 'account',   label: 'Account Details', icon: User      },
  { id: 'usage',     label: 'Usage & Credits', icon: Zap       },
  { id: 'billing',   label: 'Billing & Payments', icon: CreditCard },
  { id: 'settings',  label: 'Settings',        icon: Settings  },
  { id: 'developer', label: 'Developer',       icon: Terminal, devOnly: true },
];

export default function Account() {
  const { user, roles } = useAuth();
  const [account, setAccount] = useState<LatestSubscriptionResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isDeveloper = roles?.includes('developer') ?? false;
  const isAdmin = roles?.includes('admin') ?? false;
  const canSeeDeveloperTab = isDeveloper || isAdmin;

  const visibleTabs = useMemo(
    () => TABS.filter((t) => !t.devOnly || canSeeDeveloperTab),
    [canSeeDeveloperTab],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [acc] = await Promise.all([getBillingAccount(), getFeedbackAccess()]);
      setAccount(acc);
    } catch {
      setError('Failed to load account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const displayName = useMemo(() => {
    if (!account?.user) return user?.displayName ?? user?.email ?? 'User';
    const { firstName, lastName, username, email } = account.user;
    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ') || username || email;
  }, [account, user]);

  const email = account?.user?.email ?? user?.email ?? '';

  const remaining = account?.account?.remainingCredits ?? 0;
  const isUnlimited = remaining === -1;
  const isExhausted = !isUnlimited && remaining === 0 && !isDeveloper;

  const handlePaymentSuccess = useCallback((creditsAdded?: number) => {
    const msg = creditsAdded != null
      ? `Payment successful! ${creditsAdded} credits added.`
      : 'Plan upgraded successfully!';
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="account-layout">
        <div className="account-layout__sidebar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="account-sidebar__skeleton" />
          ))}
        </div>
        <div className="account-layout__content">
          <div className="account-content__skeleton-title" />
          <div className="account-content__skeleton-body" />
        </div>
      </div>
    );
  }

  return (
    <div className="account-layout">
      {/* Left sidebar */}
      <aside className="account-layout__sidebar" aria-label="Account navigation">
        <div className="account-sidebar__header">
          <div className="account-sidebar__avatar" aria-hidden>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="account-sidebar__user-info">
            <p className="account-sidebar__name">{displayName}</p>
            <p className="account-sidebar__email">{email}</p>
          </div>
        </div>

        {isExhausted && (
          <div className="account-sidebar__credits-warn">
            <AlertTriangle size={13} aria-hidden />
            <span>Credits exhausted</span>
          </div>
        )}

        <nav className="account-sidebar__nav" aria-label="Account sub-sections">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`account-sidebar__nav-item ${isActive ? 'account-sidebar__nav-item--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} aria-hidden />
                <span>{tab.label}</span>
                {tab.id === 'usage' && isExhausted && (
                  <span className="account-sidebar__nav-dot" aria-label="Attention needed" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="account-sidebar__cta-group">
          <button
            type="button"
            className="account-sidebar__upgrade-btn"
            onClick={() => { setShowUpgradeModal(true); setActiveTab('billing'); }}
          >
            Upgrade Plan
          </button>
          <button
            type="button"
            className="account-sidebar__credits-btn"
            onClick={() => { setShowBuyModal(true); setActiveTab('billing'); }}
          >
            Buy Credits
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="account-layout__content">
        {successMsg && (
          <div className="account-content__success" role="status">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="account-content__error" role="alert">
            {error}
            <button type="button" className="account-content__retry-btn" onClick={load}>
              Retry
            </button>
          </div>
        )}

        {!account && !error && (
          <p className="account-content__unavailable">
            Account information is not available yet.
          </p>
        )}

        {account && (
          <>
            {activeTab === 'account' && (
              <AccountDetailsTab account={account} displayName={displayName} isWhitelisted={isDeveloper || isAdmin} />
            )}
            {activeTab === 'usage' && (
              <UsageCreditsTab
                account={account}
                onUpgrade={() => { setShowUpgradeModal(true); }}
                onBuyCredits={() => { setShowBuyModal(true); }}
                isWhitelisted={isDeveloper || isAdmin}
              />
            )}
            {activeTab === 'billing' && (
              <BillingPaymentsTab
                account={account}
                displayName={displayName}
                email={email}
                showUpgradeModal={showUpgradeModal}
                showBuyModal={showBuyModal}
                onOpenUpgrade={() => setShowUpgradeModal(true)}
                onOpenBuy={() => setShowBuyModal(true)}
                onCloseUpgrade={() => setShowUpgradeModal(false)}
                onCloseBuy={() => setShowBuyModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'developer' && canSeeDeveloperTab && <DeveloperTab />}
          </>
        )}

        {/* Render payment modals from non-billing tabs (e.g. triggered from Usage tab) */}
        {activeTab !== 'billing' && (showUpgradeModal || showBuyModal) && (
          <BillingPaymentsTab
            account={account ?? { subscription: null, hasAccess: false }}
            displayName={displayName}
            email={email}
            showUpgradeModal={showUpgradeModal}
            showBuyModal={showBuyModal}
            onCloseUpgrade={() => setShowUpgradeModal(false)}
            onCloseBuy={() => setShowBuyModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </main>
    </div>
  );
}
