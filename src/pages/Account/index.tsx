import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
          {fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{fullName}</p>
          <p className="text-xs text-gray-600">{accountUser?.email ?? user?.email}</p>
          {joinDate && (
            <p className="text-xs text-gray-400 mt-1">Member since {joinDate}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 mb-1">Plan</p>
          <p className="font-medium text-gray-900">{plan?.tier_name ?? 'Free'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Billing cycle</p>
          <p className="font-medium text-gray-900">
            {plan?.billing_cycle ? plan.billing_cycle : 'monthly'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total credits</p>
          <p className="font-medium text-gray-900">{plan?.total_credits ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Credits remaining</p>
          <p className="font-medium text-gray-900">
            {plan?.remaining_credits === -1 ? 'Unlimited' : plan?.remaining_credits ?? 0}
          </p>
        </div>
      </div>

      {feedbackAccess && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
          <p className="text-xs text-gray-500 mb-1">Feedback access</p>
          <p className="font-medium text-gray-900">
            {feedbackAccess.can_access_full_feedback ? 'Full feedback enabled' : 'Basic feedback'}
          </p>
        </div>
      )}
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
        <p className="text-xs text-gray-500 mb-1">Interview credits used</p>
        <p className="font-medium text-gray-900">
          {plan?.used_interview_credits ?? 0} credits (~{usedInterviews} interviews)
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
        <p className="text-xs text-gray-500 mb-1">Resume credits used</p>
        <p className="font-medium text-gray-900">
          {plan?.used_resume_credits ?? 0} credits
        </p>
      </div>
      {plan?.month_reset_date && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-xs text-gray-600">
          Credits reset monthly. Next reset:{' '}
          {new Date(plan.month_reset_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-900">Transactions</p>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 border border-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-500">Page {page}</span>
            <button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-1 border border-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        {transactions.length === 0 ? (
          <p className="text-xs text-gray-500">No transactions found.</p>
        ) : (
          <table className="w-full text-xs text-gray-700">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Amount</th>
                <th className="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50">
                  <td className="py-2">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="py-2">
                    {tx.amount != null ? `${tx.amount / 100} ${tx.currency ?? 'INR'}` : '—'}
                  </td>
                  <td className="py-2 capitalize">{tx.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderDeveloper = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
        <p className="font-medium text-gray-900 mb-2">API keys</p>
        {apiKeys.length === 0 ? (
          <p className="text-xs text-gray-500 mb-3">No API keys yet.</p>
        ) : (
          <ul className="mb-3 space-y-1 text-xs text-gray-700">
            {apiKeys.map((k, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={idx} className="border border-gray-100 rounded px-2 py-1">
                {JSON.stringify(k)}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="New key label"
            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs"
          />
          <button
            type="button"
            disabled={creatingKey || !newKeyLabel.trim()}
            onClick={handleCreateKey}
            className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-600">Loading account…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Account</h1>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 flex gap-2 text-xs">
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
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full border text-xs ${
                activeTab === tab.id
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'bg-gray-100 border-gray-200 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!account && (
          <p className="text-xs text-gray-500">
            Account information is not available yet. Please try again later.
          </p>
        )}

        {account && (
          <div className="mt-2">
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
