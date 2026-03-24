import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { getPaymentPlans } from '../services/paymentService';
import type { PlanTierInfo } from '../types/account';
import { ROUTES } from '../constants/routerConstants';
import { CREDIT_COSTS } from '../constants/appConstants';

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PlanTierInfo[]>([]);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPaymentPlans()
      .then((res) => {
        const paidPlans = res.filter((p) => p.monthlyPaise > 0 || p.annualPaise > 0);
        setPlans(paidPlans);
      })
      .catch(() => {
        setError('Unable to load plans right now.');
      })
      .finally(() => setLoading(false));
  }, []);

  const hasAnnual = useMemo(() => plans.some((p) => p.annualPaise > 0), [plans]);

  return (
    <div className="relative min-h-[78vh] overflow-hidden bg-violet-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-1 text-sm font-medium text-violet-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Flexible plans for every learner
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-violet-800 md:text-5xl">
            Pricing Plans
          </h1>
          <p className="mx-auto max-w-2xl text-slate-600">
            Choose a plan that fits your interview prep journey. Billing and checkout are synced with live backend pricing.
          </p>
        </div>

        <div className="mb-10 flex items-center justify-center gap-3 relative z-10">
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${billingInterval === 'monthly' ? 'bg-violet-700 text-white shadow-md' : 'bg-white/90 text-slate-700 border border-slate-200 hover:bg-white'}`}
            onClick={() => setBillingInterval('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            disabled={!hasAnnual}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${billingInterval === 'annual' ? 'bg-violet-700 text-white shadow-md' : 'bg-white/90 text-slate-700 border border-slate-200 hover:bg-white'} disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={() => setBillingInterval('annual')}
          >
            Annual
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            Plans are not configured yet. Please check back shortly.
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 relative z-10">
            {plans.map((plan, index) => {
              const activePrice =
                billingInterval === 'annual' ? plan.annualPaise : plan.monthlyPaise;
              const displayPrice = activePrice > 0 ? formatRupees(activePrice) : 'Not available';
              const isPopular = index === 1 || plan.slug.toLowerCase() === 'pro';
              const monthlyCredits = plan.credits;
              const interviewSessions =
                monthlyCredits === -1 ? -1 : Math.floor(monthlyCredits / CREDIT_COSTS.INTERVIEW);
              const resumeAnalyses =
                monthlyCredits === -1 ? -1 : Math.floor(monthlyCredits / CREDIT_COSTS.RESUME);
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 ${isPopular ? 'border-violet-800 bg-violet-800 text-white' : 'border-violet-100 bg-white/90 text-slate-900'}`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-6 rounded-full bg-violet-200 px-3 py-1 text-xs font-bold text-violet-900 shadow">
                      MOST POPULAR
                    </span>
                  )}
                  <h2 className={`mb-1 text-2xl font-semibold ${isPopular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h2>
                  <p className={`mb-6 text-sm ${isPopular ? 'text-violet-100' : 'text-slate-500'}`}>{plan.slug}</p>

                  <div className="mb-6">
                    <p className={`text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-slate-900'}`}>{displayPrice}</p>
                    <p className={`text-sm ${isPopular ? 'text-violet-200' : 'text-slate-500'}`}>/{billingInterval === 'annual' ? 'year' : 'month'}</p>
                  </div>

                  <ul className={`mb-8 space-y-3 ${isPopular ? 'text-violet-100' : 'text-slate-700'}`}>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${isPopular ? 'text-white' : 'text-violet-600'}`} />
                      {plan.credits === -1 ? 'Unlimited credits' : `${plan.credits} credits`}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${isPopular ? 'text-white' : 'text-violet-600'}`} />
                      {interviewSessions === -1
                        ? 'Unlimited interview sessions/month'
                        : `${interviewSessions} interview sessions/month (${CREDIT_COSTS.INTERVIEW} credits/session)`}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${isPopular ? 'text-white' : 'text-violet-600'}`} />
                      {resumeAnalyses === -1
                        ? 'Unlimited resume analyses/month'
                        : `${resumeAnalyses} resume analyses/month (${CREDIT_COSTS.RESUME} credit/analysis)`}
                    </li>
                  </ul>

                  <Link
                    to={ROUTES.SIGNUP}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${isPopular ? 'bg-white text-violet-800 hover:bg-violet-50' : 'bg-violet-700 text-white hover:bg-violet-800'}`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
