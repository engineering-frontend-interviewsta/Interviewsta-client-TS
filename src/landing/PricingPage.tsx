import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, Sparkles, ArrowRight, Zap, Shield, Headphones, BarChart3, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPaymentPlans } from '../services/paymentService';
import type { PlanTierInfo } from '../types/account';
import { ROUTES } from '../constants/routerConstants';
import { CREDIT_COSTS } from '../constants/appConstants';

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

const FREE_FEATURES = [
  '3 interview sessions / month',
  '1 resume analysis / month',
  'Basic AI feedback',
  'Session history (7 days)',
];

const FREE_MISSING = [
  'Detailed score breakdown',
  'Priority support',
  'Advanced analytics',
];

const TRUST_ITEMS = [
  { icon: Zap, label: 'Instant AI feedback after every session' },
  { icon: Shield, label: 'No hidden fees, transparent pricing' },
  { icon: Headphones, label: 'Priority support on paid plans' },
  { icon: BarChart3, label: 'Detailed analytics to track growth' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
      .catch(() => setError('Unable to load plans right now.'))
      .finally(() => setLoading(false));
  }, []);

  const hasAnnual = useMemo(() => plans.some((p) => p.annualPaise > 0), [plans]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-surface-alt)]">
      {/* Decorative orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-40" />
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)]">
            <Sparkles className="h-4 w-4" />
            Flexible plans for every learner
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-text)] md:text-5xl lg:text-6xl">
            Simple,{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[var(--color-text-muted)]">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 flex items-center justify-center gap-3"
        >
          <button
            type="button"
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              billingInterval === 'monthly'
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
            }`}
            onClick={() => setBillingInterval('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            disabled={!hasAnnual}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              billingInterval === 'annual'
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            onClick={() => setBillingInterval('annual')}
          >
            Annual
            {hasAnnual && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                Save 20%
              </span>
            )}
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] p-5 text-center text-[var(--color-error-text)]">
            {error}
          </div>
        )}

        {/* No plans */}
        {!loading && !error && plans.length === 0 && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-muted)]">
            Plans are not configured yet. Please check back shortly.
          </div>
        )}

        {/* Plans grid */}
        {!loading && !error && plans.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {/* Free tier card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-md)]"
            >
              <h2 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Free</h2>
              <p className="mb-6 text-sm text-[var(--color-text-muted)]">Get started at no cost</p>
              <div className="mb-6">
                <p className="text-4xl font-extrabold text-[var(--color-text)]">₹0</p>
                <p className="text-sm text-[var(--color-text-muted)]">/month</p>
              </div>
              <ul className="mb-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
                {FREE_MISSING.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-subtle)] line-through">
                    <X className="h-4 w-4 flex-shrink-0 text-[var(--color-text-subtle)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={ROUTES.SIGNUP}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Paid plan cards */}
            {plans.map((plan, index) => {
              const activePrice = billingInterval === 'annual' ? plan.annualPaise : plan.monthlyPaise;
              const displayPrice = activePrice > 0 ? formatRupees(activePrice) : 'Not available';
              const isPopular = index === 0 || plan.slug.toLowerCase() === 'pro';
              const monthlyCredits = plan.credits;
              const interviewSessions =
                monthlyCredits === -1 ? -1 : Math.floor(monthlyCredits / CREDIT_COSTS.INTERVIEW);
              const resumeAnalyses =
                monthlyCredits === -1 ? -1 : Math.floor(monthlyCredits / CREDIT_COSTS.RESUME);

              return (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`relative rounded-[var(--radius-2xl)] border p-7 shadow-[var(--shadow-lg)] transition ${
                    isPopular
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-6 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--color-primary)] shadow-md">
                      MOST POPULAR
                    </span>
                  )}

                  <h2 className={`mb-1 text-2xl font-bold ${isPopular ? 'text-white' : 'text-[var(--color-text)]'}`}>
                    {plan.name}
                  </h2>
                  <p className={`mb-6 text-sm ${isPopular ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                    {plan.slug}
                  </p>

                  <div className="mb-6">
                    <p className={`text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-[var(--color-text)]'}`}>
                      {displayPrice}
                    </p>
                    <p className={`text-sm ${isPopular ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>
                      /{billingInterval === 'annual' ? 'year' : 'month'}
                    </p>
                  </div>

                  <ul className={`mb-8 space-y-3 ${isPopular ? 'text-white/90' : 'text-[var(--color-text-muted)]'}`}>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isPopular ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                      {plan.credits === -1 ? 'Unlimited credits' : `${plan.credits} credits`}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isPopular ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                      {interviewSessions === -1
                        ? 'Unlimited interview sessions'
                        : `${interviewSessions} interview sessions/month`}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isPopular ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                      {resumeAnalyses === -1
                        ? 'Unlimited resume analyses'
                        : `${resumeAnalyses} resume analyses/month`}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isPopular ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                      Detailed AI feedback &amp; score breakdown
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isPopular ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                      Full session history &amp; transcripts
                    </li>
                    {isPopular && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-white" />
                        Priority support
                      </li>
                    )}
                  </ul>

                  <Link
                    to={ROUTES.SIGNUP}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] px-4 py-3 text-sm font-semibold transition ${
                      isPopular
                        ? 'bg-white text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                <Icon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 rounded-[var(--radius-2xl)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] p-10 text-center text-white"
        >
          <h2 className="mb-3 text-3xl font-bold">Still not sure?</h2>
          <p className="mb-8 text-white/80 text-lg">
            Start with the free plan — no credit card required. Upgrade whenever you're ready.
          </p>
          <Link
            to={ROUTES.SIGNUP}
            className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] bg-white px-8 py-3.5 text-sm font-semibold text-[var(--color-primary)] shadow-lg hover:bg-[var(--color-primary-light)] transition"
          >
            Start Free Today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
