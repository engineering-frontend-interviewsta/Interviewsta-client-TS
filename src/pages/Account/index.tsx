import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBillingAccount } from '../../services/accountService';
import { ROUTES } from '../../constants/routerConstants';
import type { BillingAccount } from '../../types/account';
import LoadingFallback from '../../components/shared/LoadingFallback';

export default function Account() {
  const { user, role } = useAuth();
  const [account, setAccount] = useState<BillingAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBillingAccount()
      .then(setAccount)
      .catch(() => setError('Failed to load account'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingFallback />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account</h1>
        <p className="text-gray-600 mb-6">
          {user?.displayName ?? user?.email}. Role: {role ?? '—'}
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {account && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Billing & plan</h2>
            <p className="text-gray-600 text-sm">
              Plan: {account.plan ?? '—'} · Credits: {account.credits_remaining ?? '—'}
            </p>
          </div>
        )}
        <Link to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
