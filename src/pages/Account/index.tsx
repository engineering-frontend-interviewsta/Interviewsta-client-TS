import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Account.css';
import {
  getBillingAccount,
  getFeedbackAccess,
  getTransactions,
} from '../../services/accountService';
import type {
  LatestSubscriptionResult,
  FeedbackAccessResult,
  TransactionLogView,
} from '../../types/account';

type TabId = 'overview' | 'usage' | 'billing';

export default function Account() {
  const { user } = useAuth();
  const [account, setAccount] = useState<LatestSubscriptionResult | null>(null);
  const [transactions, setTransactions] = useState<TransactionLogView[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [feedbackAccess, setFeedbackAccessState] = useState<FeedbackAccessResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setTransactions(res.data ?? []);
        setTotalPages(res.totalPages ?? 0);
      } catch {
        setTransactions([]);
      }
    };
    void loadTx();
  }, [page]);

  const accountUser = account?.user;
  const plan = account?.account;
  const subscription = account?.subscription;

  const fullName = useMemo(() => {
    if (!accountUser) return user?.displayName ?? user?.email ?? 'User';
    const parts = [accountUser.firstName, accountUser.lastName].filter(Boolean);
    return parts.join(' ') || accountUser.username || accountUser.email;
  }, [accountUser, user]);

  const joinDate = accountUser?.dateJoined
    ? new Date(accountUser.dateJoined).toLocaleDateString()
    : undefined;

  const usedInterviews = plan?.usedInterviewCredits
    ? Math.floor(plan.usedInterviewCredits / 2)
    : 0;

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
          <div>
            <p className="account__label">Plan</p>
            <p className="account__value">
              {plan?.tierName ?? subscription?.tierName ?? 'Free'}
            </p>
          </div>
          <div>
            <p className="account__label">Billing cycle</p>
            <p className="account__value">
              {plan?.billingCycle ?? subscription?.billingInterval ?? 'monthly'}
            </p>
          </div>
          <div>
            <p className="account__label">Total credits</p>
            <p className="account__value">{plan?.totalCredits ?? 0}</p>
          </div>
          <div>
            <p className="account__label">Credits remaining</p>
            <p className="account__value">
              {plan?.remainingCredits === -1 ? 'Unlimited' : plan?.remainingCredits ?? 0}
            </p>
          </div>
        </div>
      </div>

      {feedbackAccess && (
        <div className="account__card">
          <p className="account__label">Feedback access</p>
          <p className="account__value">
            {feedbackAccess.canAccessFullFeedback ? 'Full feedback enabled' : 'Basic feedback'}
          </p>
        </div>
      )}
    </div>
  );

  const renderUsage = () => (
    <div>
      <div className="account__card">
        <p className="account__label">Interview credits used</p>
        <p className="account__value">
          {plan?.usedInterviewCredits ?? 0} credits (~{usedInterviews} interviews)
        </p>
      </div>
      <div className="account__card">
        <p className="account__label">Resume credits used</p>
        <p className="account__value">{plan?.usedResumeCredits ?? 0} credits</p>
      </div>
      {plan?.monthResetDate && (
        <div className="account__card">
          <p
            className="account__value"
            style={{
              fontWeight: 400,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Credits reset monthly. Next reset:{' '}
            {new Date(plan.monthResetDate).toLocaleDateString()}
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
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="account__label" style={{ margin: 0 }}>
              Page {page}
              {totalPages > 0 ? ` of ${totalPages}` : ''}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
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
                  <td>
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleString()
                      : '—'}
                  </td>
                  <td>
                    {tx.amountCents != null
                      ? `${tx.amountCents / 100} ${tx.currencyCode ?? 'INR'}`
                      : '—'}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{tx.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
        {error && (
          <div className="account__error" role="alert">
            {error}
          </div>
        )}

        <div className="account__tabs" role="tablist" aria-label="Account sections">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'usage', label: 'Usage & credits' },
              { id: 'billing', label: 'Billing' },
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
          </div>
        )}
      </div>
    </div>
  );
}
