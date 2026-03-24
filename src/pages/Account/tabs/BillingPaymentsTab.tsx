import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CreditCard, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import type {
  LatestSubscriptionResult,
  TransactionLogView,
  PaginatedTransactionsResult,
  PlanTierInfo,
  RazorpayOrderResult,
} from '../../../types/account';
import { getTransactions } from '../../../services/accountService';
import { createOrder, verifyPayment, getPaymentPlans } from '../../../services/paymentService';
import { useRazorpay } from '../../../hooks/useRazorpay';
import { CREDITS_PER_DOLLAR, USD_TO_INR } from '../../../constants/appConstants';

interface Props {
  account: LatestSubscriptionResult;
  displayName: string;
  email: string;
  showUpgradeModal: boolean;
  showBuyModal: boolean;
  onOpenUpgrade?: () => void;
  onOpenBuy?: () => void;
  onCloseUpgrade: () => void;
  onCloseBuy: () => void;
  onPaymentSuccess: (creditsAdded?: number) => void;
}

// ─── Upgrade Plan Modal ────────────────────────────────────────────────────

function UpgradeModal({
  onClose,
  onSuccess,
  displayName,
  email,
}: {
  onClose: () => void;
  onSuccess: (creditsAdded?: number) => void;
  displayName: string;
  email: string;
}) {
  const [plans, setPlans] = useState<PlanTierInfo[]>([]);
  const [selected, setSelected] = useState<PlanTierInfo | null>(null);
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openCheckout, isLoaded } = useRazorpay();

  useEffect(() => {
    getPaymentPlans()
      .then((p) => {
        const paid = p.filter((t) => t.monthlyPaise > 0);
        setPlans(paid);
        if (paid.length > 0) setSelected(paid[0]);
      })
      .catch(() => setError('Could not load plans.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = useCallback(async () => {
    if (!selected) return;
    setError(null);
    setPaying(true);
    try {
      const orderData: RazorpayOrderResult = await createOrder({
        type: 'plan_upgrade',
        tierId: selected.id,
        billingInterval: interval,
      });

      openCheckout({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Interviewsta',
        description: `${selected.name} Plan (${interval})`,
        order_id: orderData.orderId,
        prefill: { name: displayName, email },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              ...response,
              type: 'plan_upgrade',
              tierId: selected.id,
              billingInterval: interval,
            });
            onSuccess(result.creditsAdded);
            onClose();
          } catch {
            setError('Payment verification failed. Contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
    } catch {
      setError('Could not initiate payment.');
      setPaying(false);
    }
  }, [selected, interval, openCheckout, displayName, email, onSuccess, onClose]);

  const price = selected
    ? interval === 'annual'
      ? selected.annualPaise
      : selected.monthlyPaise
    : 0;
  const isIntervalPriceAvailable = price > 0;
  const hasAnyAnnualPricing = plans.some((plan) => plan.annualPaise > 0);

  return (
    <div className="account-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
      <motion.div
        className="account-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="account-modal"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.18 }}
      >
        <button type="button" className="account-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} aria-hidden />
        </button>
        <h2 id="upgrade-title" className="account-modal__title">Upgrade Plan</h2>
        <p className="account-modal__subtitle">Choose a plan that fits your needs</p>

        {error && <p className="account-modal__error" role="alert">{error}</p>}

        {loading ? (
          <div className="account-modal__loading"><Loader2 size={20} className="account-modal__spinner" /></div>
        ) : (
          <>
            <div className="account-modal__interval-toggle">
              <button
                type="button"
                className={`account-modal__interval-btn ${interval === 'monthly' ? 'account-modal__interval-btn--active' : ''}`}
                onClick={() => setInterval('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`account-modal__interval-btn ${interval === 'annual' ? 'account-modal__interval-btn--active' : ''}`}
                onClick={() => setInterval('annual')}
                disabled={!hasAnyAnnualPricing}
              >
                Annual <span className="account-modal__save-badge">Save 20%</span>
              </button>
            </div>

            <div className="account-modal__plan-list">
              {plans.map((plan) => {
                const paise = interval === 'annual' ? plan.annualPaise : plan.monthlyPaise;
                const rupees = (paise / 100).toFixed(0);
                const isSelected = selected?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={`account-modal__plan-card ${isSelected ? 'account-modal__plan-card--selected' : ''}`}
                    onClick={() => setSelected(plan)}
                  >
                    <div className="account-modal__plan-header">
                      <span className="account-modal__plan-name">{plan.name}</span>
                      {isSelected && <CheckCircle size={16} aria-hidden />}
                    </div>
                    <p className="account-modal__plan-credits">
                      {plan.credits === -1 ? 'Unlimited' : plan.credits} credits
                    </p>
                    <p className="account-modal__plan-price">
                      {paise > 0 ? (
                        <>₹{rupees}<span className="account-modal__plan-period">/{interval === 'annual' ? 'yr' : 'mo'}</span></>
                      ) : (
                        <span className="account-modal__plan-period">Not available</span>
                      )}
                    </p>
                  </button>
                );
              })}
            </div>
            {!isIntervalPriceAvailable && selected && (
              <p className="account-modal__error" role="alert">
                Selected billing interval is not configured for this plan yet.
              </p>
            )}

            <button
              type="button"
              className="account-modal__pay-btn"
              disabled={!selected || paying || !isLoaded || !isIntervalPriceAvailable}
              onClick={handlePay}
            >
              {paying ? (
                <Loader2 size={16} className="account-modal__spinner" />
              ) : (
                <>
                  <CreditCard size={16} aria-hidden />
                  Pay ₹{(price / 100).toFixed(0)} &amp; Upgrade
                  <ArrowRight size={16} aria-hidden />
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Buy Credits Modal ─────────────────────────────────────────────────────

function BuyCreditsModal({
  onClose,
  onSuccess,
  displayName,
  email,
}: {
  onClose: () => void;
  onSuccess: (creditsAdded?: number) => void;
  displayName: string;
  email: string;
}) {
  const [amountRupees, setAmountRupees] = useState<string>('415');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openCheckout, isLoaded } = useRazorpay();

  const parsedRupees = Math.max(1, parseInt(amountRupees || '0', 10) || 0);
  // Convert rupees → dollars → credits (2 credits per $1)
  const creditsPreview = Math.floor((parsedRupees / USD_TO_INR) * CREDITS_PER_DOLLAR);
  const amountPaise = parsedRupees * 100;

  const handlePay = useCallback(async () => {
    if (amountPaise < USD_TO_INR * 100) return;
    setError(null);
    setPaying(true);
    try {
      const orderData: RazorpayOrderResult = await createOrder({
        type: 'credit_purchase',
        amountPaise,
      });

      openCheckout({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Interviewsta',
        description: `${creditsPreview} Credits`,
        order_id: orderData.orderId,
        prefill: { name: displayName, email },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              ...response,
              type: 'credit_purchase',
              amountPaise,
            });
            onSuccess(result.creditsAdded);
            onClose();
          } catch {
            setError('Payment verification failed. Contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
    } catch {
      setError('Could not initiate payment.');
      setPaying(false);
    }
  }, [amountPaise, creditsPreview, openCheckout, displayName, email, onSuccess, onClose]);

  return (
    <div className="account-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="credits-title">
      <motion.div
        className="account-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="account-modal account-modal--sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.18 }}
      >
        <button type="button" className="account-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} aria-hidden />
        </button>
        <h2 id="credits-title" className="account-modal__title">Buy Credits</h2>
        <p className="account-modal__subtitle">2 credits per $1 spent</p>

        {error && <p className="account-modal__error" role="alert">{error}</p>}

        <div className="account-modal__credit-input-wrap">
          <label htmlFor="credit-amount" className="account-modal__label">Amount (₹)</label>
          <div className="account-modal__input-row">
            <span className="account-modal__currency-prefix">₹</span>
            <input
              id="credit-amount"
              type="number"
              min={1}
              step={1}
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              className="account-modal__amount-input"
            />
          </div>
        </div>

        <div className="account-modal__credit-preview">
          <Zap size={18} aria-hidden />
          <span>You&apos;ll receive <strong>{creditsPreview} credits</strong></span>
        </div>

        <div className="account-modal__quick-amounts">
          {/* ~$5, ~$10, ~$20, ~$50 in INR */}
          {[415, 830, 1660, 4150].map((v) => (
            <button
              key={v}
              type="button"
              className={`account-modal__quick-btn ${parsedRupees === v ? 'account-modal__quick-btn--active' : ''}`}
              onClick={() => setAmountRupees(String(v))}
            >
              ₹{v}
              <span className="account-modal__quick-btn-credits">
                {Math.floor((v / USD_TO_INR) * CREDITS_PER_DOLLAR)} cr
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="account-modal__pay-btn"
          disabled={amountPaise < USD_TO_INR * 100 || paying || !isLoaded}
          onClick={handlePay}
        >
          {paying ? (
            <Loader2 size={16} className="account-modal__spinner" />
          ) : (
            <>
              <CreditCard size={16} aria-hidden />
              Pay ₹{parsedRupees} for {creditsPreview} credits
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────────────────

export default function BillingPaymentsTab({
  account,
  displayName,
  email,
  showUpgradeModal,
  showBuyModal,
  onOpenUpgrade,
  onOpenBuy,
  onCloseUpgrade,
  onCloseBuy,
  onPaymentSuccess,
}: Props) {
  const [transactions, setTransactions] = useState<TransactionLogView[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [txLoading, setTxLoading] = useState(true);

  const loadTransactions = useCallback(async (p: number) => {
    setTxLoading(true);
    try {
      const res: PaginatedTransactionsResult = await getTransactions(p);
      setTransactions(res.data ?? []);
      setTotalPages(res.totalPages ?? 0);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions(page);
  }, [page, loadTransactions]);

  const sub = account.subscription;
  const plan = account.account;
  const remaining = plan?.remainingCredits ?? 0;
  const isUnlimited = remaining === -1;

  return (
    <div className="account-tab">
      <h2 className="account-tab__heading">Billing &amp; Payments</h2>

      {/* Plan summary */}
      <div className="account-tab__billing-plan-card">
        <div className="account-tab__billing-plan-info">
          <p className="account-tab__billing-plan-name">{plan?.tierName ?? sub?.tierName ?? 'Free'}</p>
          <p className="account-tab__billing-plan-meta">
            {isUnlimited ? 'Unlimited credits' : `${remaining} credits remaining`}
            {sub && ` · renews ${new Date(sub.endsAt).toLocaleDateString()}`}
          </p>
        </div>
        <div className="account-tab__billing-plan-actions">
          <button type="button" className="account-tab__btn-primary" onClick={onOpenUpgrade}>
            Upgrade Plan
          </button>
          <button type="button" className="account-tab__btn-secondary" onClick={onOpenBuy}>
            Buy Credits
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="account-tab__tx-section">
        <div className="account-tab__tx-header">
          <p className="account-tab__tx-title">Transaction History</p>
          <div className="account-tab__pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="account-tab__pagination-btn"
            >
              ←
            </button>
            <span className="account-tab__pagination-text">
              {page}{totalPages > 0 ? ` / ${totalPages}` : ''}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              className="account-tab__pagination-btn"
            >
              →
            </button>
          </div>
        </div>

        {txLoading ? (
          <div className="account-tab__tx-loading">
            {[1, 2, 3].map((i) => <div key={i} className="account-tab__tx-skeleton" />)}
          </div>
        ) : transactions.length === 0 ? (
          <p className="account-tab__empty">No transactions yet.</p>
        ) : (
          <div className="account-tab__table-wrap">
            <table className="account-tab__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{tx.type?.replace('_', ' ') ?? '—'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {tx.amountCents != null ? `₹${(tx.amountCents / 100).toFixed(2)}` : '—'}
                    </td>
                    <td>
                      <span className={`account-tab__tx-status account-tab__tx-status--${tx.status ?? 'pending'}`}>
                        {tx.status ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal
            onClose={onCloseUpgrade}
            onSuccess={onPaymentSuccess}
            displayName={displayName}
            email={email}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBuyModal && (
          <BuyCreditsModal
            onClose={onCloseBuy}
            onSuccess={onPaymentSuccess}
            displayName={displayName}
            email={email}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
