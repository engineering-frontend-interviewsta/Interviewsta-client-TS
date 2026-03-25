import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Video, FileText, AlertTriangle } from 'lucide-react';
import type { LatestSubscriptionResult } from '../../../types/account';
import { CREDIT_COSTS } from '../../../constants/appConstants';

interface Props {
  account: LatestSubscriptionResult;
  onUpgrade: () => void;
  onBuyCredits: () => void;
  isWhitelisted?: boolean;
}

export default function UsageCreditsTab({ account, onUpgrade, onBuyCredits, isWhitelisted }: Props) {
  const plan = account.account;
  const remaining = plan?.remainingCredits ?? 0;
  const total = plan?.totalCredits ?? 0;
  const usedInterview = plan?.usedInterviewCredits ?? 0;
  const usedResume = plan?.usedResumeCredits ?? 0;
  // Whitelisted roles (developer/admin) have unlimited credits regardless of what the billing API returns
  const isUnlimited = isWhitelisted === true || remaining === -1;
  const isExhausted = !isUnlimited && remaining === 0;

  const usedTotal = usedInterview + usedResume;
  const pct = total > 0 ? Math.min(100, Math.round((usedTotal / total) * 100)) : 0;

  const interviewSessions = Math.floor(usedInterview / CREDIT_COSTS.INTERVIEW);
  const resumeSessions = Math.floor(usedResume / CREDIT_COSTS.RESUME);

  const radialData = [
    {
      name: 'Used',
      value: isUnlimited ? 100 : pct,
      fill: isExhausted ? '#ef4444' : pct > 75 ? '#f97316' : '#6366f1',
    },
  ];

  return (
    <div className="account-tab">
      <h2 className="account-tab__heading">Usage &amp; Credits</h2>

      {isExhausted && (
        <div className="account-tab__exhausted-banner" role="alert">
          <AlertTriangle size={18} aria-hidden />
          <div>
            <p className="account-tab__exhausted-title">You&apos;ve used all your credits</p>
            <p className="account-tab__exhausted-body">
              Upgrade your plan or buy on-demand credits to continue.
            </p>
          </div>
          <div className="account-tab__exhausted-actions">
            <button type="button" className="account-tab__btn-primary" onClick={onUpgrade}>
              Upgrade Plan
            </button>
            <button type="button" className="account-tab__btn-secondary" onClick={onBuyCredits}>
              Buy Credits
            </button>
          </div>
        </div>
      )}

      <div className="account-tab__usage-hero">
        <div className="account-tab__radial-wrap">
          {isUnlimited ? (
            <div className="account-tab__unlimited-badge">
              <Zap size={28} aria-hidden />
              <span>Unlimited</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                barSize={14}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'var(--color-border-light)' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--color-border-light)' }}
                  formatter={(value) => [`${value ?? 0}%`, 'Used']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
          {!isUnlimited && (
            <div className="account-tab__radial-center">
              <p className="account-tab__radial-pct">{pct}%</p>
              <p className="account-tab__radial-label">used</p>
            </div>
          )}
        </div>

        <div className="account-tab__credit-summary">
          <div className="account-tab__credit-stat">
            <p className="account-tab__credit-stat-value">
              {isUnlimited ? '∞' : remaining}
            </p>
            <p className="account-tab__credit-stat-label">Credits remaining</p>
          </div>
          <div className="account-tab__credit-stat">
            <p className="account-tab__credit-stat-value">{isUnlimited ? '∞' : total}</p>
            <p className="account-tab__credit-stat-label">Total credits</p>
          </div>
          <div className="account-tab__credit-stat">
            <p className="account-tab__credit-stat-value">{usedTotal}</p>
            <p className="account-tab__credit-stat-label">Credits used</p>
          </div>
        </div>
      </div>

      <div className="account-tab__usage-breakdown">
        <div className="account-tab__usage-item">
          <div className="account-tab__usage-item-header">
            <Video size={16} aria-hidden />
            <span>Interview sessions</span>
            <span className="account-tab__usage-count">{interviewSessions} sessions</span>
          </div>
          <div className="account-tab__progress-track">
            <div
              className="account-tab__progress-fill account-tab__progress-fill--interview"
              style={{ width: total > 0 ? `${Math.min(100, (usedInterview / total) * 100)}%` : '0%' }}
            />
          </div>
          <p className="account-tab__usage-meta">{usedInterview} credits ({CREDIT_COSTS.INTERVIEW} credits/session)</p>
        </div>

        <div className="account-tab__usage-item">
          <div className="account-tab__usage-item-header">
            <FileText size={16} aria-hidden />
            <span>Resume analyses</span>
            <span className="account-tab__usage-count">{resumeSessions} analyses</span>
          </div>
          <div className="account-tab__progress-track">
            <div
              className="account-tab__progress-fill account-tab__progress-fill--resume"
              style={{ width: total > 0 ? `${Math.min(100, (usedResume / total) * 100)}%` : '0%' }}
            />
          </div>
          <p className="account-tab__usage-meta">{usedResume} credits ({CREDIT_COSTS.RESUME} credit/analysis)</p>
        </div>
      </div>

      {plan?.monthResetDate && (
        <p className="account-tab__reset-note">
          Credits reset monthly. Next reset: {new Date(plan.monthResetDate).toLocaleDateString()}
        </p>
      )}

      {!isExhausted && !isUnlimited && (
        <div className="account-tab__cta-row">
          <button type="button" className="account-tab__btn-primary" onClick={onUpgrade}>
            Upgrade Plan
          </button>
          <button type="button" className="account-tab__btn-secondary" onClick={onBuyCredits}>
            Buy Credits
          </button>
        </div>
      )}
    </div>
  );
}
