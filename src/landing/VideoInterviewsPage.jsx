import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play, ArrowRight, Sparkles, CheckCircle,
  Zap, Shield, TrendingUp, Clock,
  Briefcase, Code2, Users, Mic, Target, Building2,
} from 'lucide-react';
import InterviewMockup from './home/InterviewMockup';
import {
  COMPANY_THUMBS, DSA_THUMBS, CASE_STUDY_THUMBS,
  ThumbCard, MarqueeRow,
} from './home/VideoInterviewsShared';

// ─── Data ─────────────────────────────────────────────────────────────────────

const GLEE_YOUTUBE_ID = 'oXDGfUoxb-c';

const STATS = [
  { value: '5,000+', label: 'Questions' },
  { value: '100+',   label: 'Interviews' },
  { value: '9+',     label: 'Categories' },
  { value: '24/7',   label: 'Available' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Adapts in Real-Time',
    description: 'Glee listens to every word and adjusts follow-up questions based on your answers — just like a real interviewer.',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Safe Space to Fail',
    description: 'Practice without judgment. Make mistakes, learn from them, and build the muscle memory you need for the real thing.',
    color: 'from-green-400 to-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Growth',
    description: 'Every session is scored and stored. Watch your confidence and performance improve over time with detailed analytics.',
    color: 'from-blue-400 to-cyan-600',
  },
  {
    icon: Clock,
    title: 'Instant Feedback',
    description: 'No waiting. Get a full breakdown of your communication, technical accuracy, and areas to improve right after each session.',
    color: 'from-violet-400 to-purple-600',
  },
];

const INTERVIEW_TYPES = [
  { icon: Code2,     label: 'Technical',    color: 'bg-violet-100 text-violet-700', duration: '45 min' },
  { icon: Users,     label: 'HR / Behavioral', color: 'bg-blue-100 text-blue-700',  duration: '30 min' },
  { icon: Briefcase, label: 'Case Study',   color: 'bg-orange-100 text-orange-700', duration: '60 min' },
  { icon: Mic,       label: 'Debate',       color: 'bg-red-100 text-red-700',       duration: '35 min' },
  { icon: Target,    label: 'Role-Based',   color: 'bg-indigo-100 text-indigo-700', duration: '45 min' },
  { icon: Building2, label: 'Company-Specific', color: 'bg-slate-100 text-slate-700', duration: '60 min' },
];

const CONSULTING_TOPICS = [
  { name: 'Profitability',        description: 'Diagnose revenue and cost drivers to identify profit improvement levers.' },
  { name: 'Market Entry',         description: 'Evaluate attractiveness and feasibility of entering a new market.' },
  { name: 'Growth Strategy',      description: 'Identify organic and inorganic growth opportunities for a business.' },
  { name: 'M&A',                  description: 'Assess strategic fit, synergies, and integration risks.' },
  { name: 'Operations & Cost',    description: 'Streamline operations and reduce costs without sacrificing quality.' },
  { name: 'Pricing Strategy',     description: 'Determine optimal pricing models to maximise revenue.' },
  { name: 'Product & Innovation', description: 'Evaluate product-market fit and build innovation pipelines.' },
  { name: 'Turnaround & Crisis',  description: 'Stabilise and revive a distressed business through rapid structural changes.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const VideoInterviewsPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">

      {/* ══ HERO — dark cinematic, mockup as centerpiece ══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#1a0a2e] to-[#0f0a1e] pt-20 pb-0">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 py-2 text-sm font-medium">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4 text-violet-300" />
              </motion.div>
              AI-Powered Interview Practice
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
              Practice with{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                Glee
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              The AI interviewer that adapts to you. Real questions, real feedback, zero judgment.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex justify-center gap-4 mb-12"
          >
            <a href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-violet-500/30 inline-flex items-center gap-2 hover:shadow-violet-500/50 transition-shadow"
              >
                <Play className="h-4 w-4" /> Start Interview <ArrowRight className="h-4 w-4" />
              </motion.button>
            </a>
            <a href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 text-white/80 hover:text-white hover:border-white/40 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
              >
                View Pricing
              </motion.button>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex justify-center gap-10 mb-12"
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* ── THE MOCKUP — sits at the bottom of the hero, bleeding into next section ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-5xl"
          >
            {/* Glow behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-b from-violet-600/20 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <InterviewMockup />
            {/* Fade bottom of mockup into next section */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-surface-alt)] to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES — 2×2 bento grid ══ */}
      <section className="bg-[var(--color-surface-alt)] pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Why Glee</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)]">Built Different</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="relative bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-2xl p-7 overflow-hidden group cursor-pointer"
              >
                {/* Gradient accent top-left */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${f.color} rounded-l-2xl`} />
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.color} opacity-60`} />
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative z-10 flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text)] text-lg mb-2">{f.title}</h3>
                    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INTERVIEW TYPES — pill grid ══ */}
      <section className="bg-[var(--color-surface)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Interview Types</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3">Pick Your Challenge</h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">Every format, every role, every level — all in one place.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INTERVIEW_TYPES.map((t, i) => (
              <motion.a
                key={i}
                href="/login"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] hover:border-[var(--color-primary)] rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-colors duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">{t.label}</p>
                  <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">{t.duration}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-subtle)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPANY LIBRARY marquee ══ */}
      <div className="bg-[var(--color-surface-alt)] py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Company Library</span>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-2">Practice for Top Companies</h2>
            <p className="text-[var(--color-text-muted)] text-lg">Company-specific interview tracks with real-world questions</p>
          </motion.div>
        </div>
        <div className="space-y-4">
          <MarqueeRow duration={109} items={COMPANY_THUMBS.slice(0, Math.ceil(COMPANY_THUMBS.length / 2)).map(item => <ThumbCard key={item.id} item={item} subLabel="Company Interview" />)} />
          <MarqueeRow duration={90} reverse items={COMPANY_THUMBS.slice(Math.ceil(COMPANY_THUMBS.length / 2)).map(item => <ThumbCard key={item.id} item={item} subLabel="Company Interview" />)} />
        </div>
      </div>

      {/* ══ DSA marquee ══ */}
      <div className="bg-[var(--color-surface)] py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">DSA</span>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-2">Data Structures & Algorithms</h2>
            <p className="text-[var(--color-text-muted)] text-lg">Deep-dive sessions on every core DSA topic</p>
          </motion.div>
        </div>
        <MarqueeRow duration={80} items={DSA_THUMBS.map(item => <ThumbCard key={item.id} item={item} subLabel="DSA Interview" />)} />
      </div>

      {/* ══ CASE STUDIES marquee ══ */}
      <div className="bg-[var(--color-surface-alt)] py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Case Studies</span>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-2">Indian Startup Case Studies</h2>
            <p className="text-[var(--color-text-muted)] text-lg">Real business scenarios from India's most iconic startups</p>
          </motion.div>
        </div>
        <MarqueeRow duration={34} reverse items={CASE_STUDY_THUMBS.map(item => <ThumbCard key={item.id} item={item} subLabel="Case Study Interview" />)} />
      </div>

      {/* ══ CONSULTING FRAMEWORKS ══ */}
      <section className="bg-[var(--color-surface)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Consulting</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3">Consulting Frameworks</h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">Master the 8 core frameworks used in McKinsey, BCG, and Bain interviews</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {CONSULTING_TOPICS.map((topic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] hover:border-[var(--color-primary)] rounded-2xl p-5 transition-colors duration-200 group"
              >
                <div className="w-9 h-9 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center mb-3">
                  <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-bold text-[var(--color-text)] mb-1.5 text-sm">{topic.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{topic.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] py-24">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Ace Your Interview?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join 5,000+ candidates already preparing with Interviewsta.AI</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-[var(--radius-xl)] font-semibold text-lg shadow-xl hover:shadow-2xl transition-all">
                  Start Free Today →
                </motion.button>
              </a>
              <a href="/pricing">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="border border-white/40 text-white hover:bg-white/10 px-8 py-4 rounded-[var(--radius-xl)] font-semibold text-lg transition-all">
                  View Pricing
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default VideoInterviewsPage;
