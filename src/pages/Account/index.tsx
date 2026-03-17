import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Account.css';
import {
  getApiKeys,
  getBillingAccount,
  getFeedbackAccess,
  getTransactions,
} from '../../services/accountService';
import type { BillingAccount, TransactionItem } from '../../types/account';

type TabId = 'overview' | 'usage' | 'billing' | 'developer';

export default function Account() {
  const { user } = useAuth();
  const [account, setAccount] = useState<BillingAccount | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [apiKeys, setApiKeys] = useState<unknown[]>([]);
  const [feedbackAccess, setFeedbackAccessState] = useState<{
    can_access_full_feedback?: boolean;
    tier?: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [acc, access] = await Promise.all([
          getBillingAccount(),
          getFeedbackAccess(),
        ]);
        setAccount(acc);
        setFeedbackAccessState(access);
      } catch {
        setError('Failed to load account.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const loadTx = async () => {
      try {
        const res = await getTransactions(page);
        const list = res.results ?? [];
        setTransactions(list);
        setHasMore(list.length === 10);
      } catch {
        // ignore for now
      }
    };
    void loadTx();
  }, [page]);

  useEffect(() => {
    const loadKeys = async () => {
      try {
        const keys = await getApiKeys();
        setApiKeys(keys);
      } catch {
        setApiKeys([]);
      }
    };
    void loadKeys();
  }, []);

  const accountUser = account?.user;
  const plan = account?.account;

  const fullName = useMemo(() => {
    if (!accountUser) return user?.displayName ?? user?.email ?? 'User';
    const parts = [accountUser.first_name, accountUser.last_name].filter(Boolean);
    return parts.join(' ') || accountUser.username || accountUser.email;
  }, [accountUser, user]);

  const joinDate = accountUser?.date_joined
    ? new Date(accountUser.date_joined).toLocaleDateString()
    : undefined;

  const usedInterviews = plan?.used_interview_credits
    ? Math.floor(plan.used_interview_credits / 2)
    : 0;

  const handleCreateKey = async () => {
    if (!newKeyLabel.trim()) return;
    try {
      setCreatingKey(true);
      await import('../../services/accountService').then((m) =>
        m.createApiKey(newKeyLabel.trim()),
      );
      setNewKeyLabel('');
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch {
      // silent failure; could add toast later
    } finally {
      setCreatingKey(false);
    }
  };

  const renderOverview = () => (
    <div>
      <div className="account__card">
        <div className="account__card-row">
          <div className="account__avatar" aria-hidden>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="account__value">{fullName}</p>
            <p className="account__label">{accountUser?.email ?? user?.email}</p>
            {joinDate && <p className="account__label">Member since {joinDate}</p>}
          </div>
        </div>
      </div>

      <div className="account__card">
        <div className="account__card-grid">
          <div><p className="account__label">Plan</p><p className="account__value">{plan?.tier_name ?? 'Free'}</p></div>
          <div><p className="account__label">Billing cycle</p><p className="account__value">{plan?.billing_cycle ? plan.billing_cycle : 'monthly'}</p></div>
          <div><p className="account__label">Total credits</p><p className="account__value">{plan?.total_credits ?? 0}</p></div>
          <div><p className="account__label">Credits remaining</p><p className="account__value">{plan?.remaining_credits === -1 ? 'Unlimited' : plan?.remaining_credits ?? 0}</p></div>
        </div>
      </div>

      {feedbackAccess && (
        <div className="account__card">
          <p className="account__label">Feedback access</p>
          <p className="account__value">
            {feedbackAccess.can_access_full_feedback ? 'Full feedback enabled' : 'Basic feedback'}
          </p>
        </div>
      )}
    </div>
  );

  const renderUsage = () => (
    <div>
      <div className="account__card">
        <p className="account__label">Interview credits used</p>
        <p className="account__value">{plan?.used_interview_credits ?? 0} credits (~{usedInterviews} interviews)</p>
      </div>
      <div className="account__card">
        <p className="account__label">Resume credits used</p>
        <p className="account__value">{plan?.used_resume_credits ?? 0} credits</p>
      </div>
      {plan?.month_reset_date && (
        <div className="account__card">
          <p className="account__value" style={{ fontWeight: 400, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Credits reset monthly. Next reset: {new Date(plan.month_reset_date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );

  const renderBilling = () => (
    <div>
      <div className="account__card">
        <div className="account__card-header">
          <p className="account__card-title">Transactions</p>
          <div className="account__pagination">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span className="account__label" style={{ margin: 0 }}>Page {page}</span>
            <button type="button" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
        {transactions.length === 0 ? (
          <p className="account__empty">No transactions found.</p>
        ) : (
          <table className="account__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}</td>
                  <td>{tx.amount != null ? `${tx.amount / 100} ${tx.currency ?? 'INR'}` : '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{tx.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderDeveloper = () => (
    <div>
      <div className="account__card">
        <p className="account__card-title">API keys</p>
        {apiKeys.length === 0 ? (
          <p className="account__empty">No API keys yet.</p>
        ) : (
          <ul className="account__key-list">
            {apiKeys.map((k, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={idx} className="account__key-item">{JSON.stringify(k)}</li>
            ))}
          </ul>
        )}
        <div className="account__key-actions">
          <input
            type="text"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="New key label"
            className="account__input"
          />
          <button
            type="button"
            disabled={creatingKey || !newKeyLabel.trim()}
            onClick={handleCreateKey}
            className="account__btn account__btn--primary"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="account__loading">Loading account…</div>;
  }

  return (
    <div className="account">
      <div className="account__inner">
        <h1 className="account__title">Account</h1>
        {error && <div className="account__error" role="alert">{error}</div>}

        <div className="account__tabs" role="tablist" aria-label="Account sections">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'usage', label: 'Usage & credits' },
              { id: 'billing', label: 'Billing' },
              { id: 'developer', label: 'Developer' },
            ] as { id: TabId; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`account__tab ${activeTab === tab.id ? 'account__tab--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!account && (
          <p className="account__unavailable">
            Account information is not available yet. Please try again later.
          </p>
        )}

        {account && (
          <div className="account__content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'usage' && renderUsage()}
            {activeTab === 'billing' && renderBilling()}
            {activeTab === 'developer' && renderDeveloper()}
          </div>
        )}
      </div>
    </div>
  );
}
