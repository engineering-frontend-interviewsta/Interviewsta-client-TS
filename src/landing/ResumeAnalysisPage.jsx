import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle, TrendingUp, Target, Sparkles,
  Search, Award, ArrowRight, Upload, ScanLine,
  ClipboardList, Lightbulb, AlertCircle, Zap,
} from 'lucide-react';

// ─── Animated score bar ───────────────────────────────────────────────────────
const ScoreBar = ({ label, score, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 400 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="w-full bg-[var(--color-border-light)] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Animated resume mockup ───────────────────────────────────────────────────
const SCORES = [
  { label: 'ATS Score',      score: 87, color: '#22c55e' },
  { label: 'Keyword Match',  score: 72, color: '#f59e0b' },
  { label: 'Format Quality', score: 91, color: '#22c55e' },
  { label: 'Impact Score',   score: 65, color: '#f59e0b' },
  { label: 'Job Alignment',  score: 78, color: '#3b82f6' },
];

const SUGGESTIONS = [
  { type: 'error',   text: 'Add quantifiable metrics to 3 bullet points' },
  { type: 'warning', text: 'Missing keywords: "TypeScript", "CI/CD", "Agile"' },
  { type: 'success', text: 'Strong action verbs detected throughout' },
  { type: 'warning', text: 'Summary section could be more targeted' },
];

const ResumeMockup = () => {
  const [activeTab, setActiveTab] = useState('scores');

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] pointer-events-none select-none">
      {/* Browser chrome */}
      <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border-light)] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-md px-3 py-1 text-xs text-[var(--color-text-muted)] font-mono">
          app.interviewsta.ai/resume/report
        </div>
      </div>

      {/* Report header */}
      <div className="px-5 py-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--color-text)]">Resume Analysis Report</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Abhishek_Kumar_Resume.pdf</p>
        </div>
        {/* Overall score ring */}
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-border-light)" strokeWidth="5" />
            <motion.circle
              cx="28" cy="28" r="22" fill="none"
              stroke="var(--color-primary)" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - 0.79) }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-[var(--color-text)]">79</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-light)]">
        {['scores', 'suggestions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            {tab === 'scores' ? 'Score Breakdown' : 'Suggestions'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5" style={{ minHeight: '220px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'scores' ? (
            <motion.div
              key="scores"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {SCORES.map((s, i) => (
                <ScoreBar key={s.label} {...s} delay={i * 100} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-start gap-3 p-3 rounded-xl text-xs ${
                    s.type === 'error'   ? 'bg-red-50 text-red-700' :
                    s.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                                          'bg-green-50 text-green-700'
                  }`}
                >
                  {s.type === 'error'   ? <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> :
                   s.type === 'warning' ? <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> :
                                          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                  <span className="leading-relaxed">{s.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { step: '01', icon: Upload,      title: 'Upload Resume',       description: 'Drop your PDF or Word document — we handle the rest.' },
  { step: '02', icon: ScanLine,    title: 'AI Scans Content',    description: 'Our AI reads every section, bullet, and keyword in seconds.' },
  { step: '03', icon: ClipboardList, title: 'Get Detailed Report', description: 'Receive scores across 11 analysis areas with clear explanations.' },
  { step: '04', icon: Lightbulb,   title: 'Apply Improvements',  description: 'Follow prioritised suggestions and re-analyse to track progress.' },
];

const FEATURES = [
  { icon: Search,    title: 'ATS Optimization',   description: 'Ensure your resume passes Applicant Tracking Systems with keyword analysis and formatting checks.', color: 'from-[var(--color-primary)] to-[var(--color-primary-muted)]' },
  { icon: Target,    title: 'Content Review',      description: 'Get feedback on your achievements, experience descriptions, and overall narrative strength.', color: 'from-violet-400 to-purple-600' },
  { icon: Award,     title: 'Impact Analysis',     description: 'Learn how to quantify achievements and demonstrate your value to potential employers.', color: 'from-amber-400 to-orange-500' },
  { icon: TrendingUp, title: 'Industry Alignment', description: 'Tailor your resume to match industry standards and role-specific requirements.', color: 'from-green-400 to-emerald-600' },
];

const ANALYSIS_AREAS = [
  'Keyword optimisation for ATS systems',
  'Formatting and visual hierarchy',
  'Action verb usage and impact statements',
  'Quantifiable achievements and metrics',
  'Skills section relevance',
  'Experience description clarity',
  'Education and certifications placement',
  'Overall length and content balance',
  'Job description matching',
  'Gap analysis',
  'Suggested improvements',
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const ResumeAnalysisPage = () => (
  <div className="min-h-screen bg-[var(--color-surface-alt)]">

    {/* ══ HERO ══ */}
    <section className="relative overflow-hidden bg-[var(--color-surface-alt)] pt-20 pb-0">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          {/* Left — text */}
          <div className="w-full lg:w-[42%] space-y-7 pb-16 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full px-5 py-2.5 text-sm font-medium"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              </motion.div>
              AI-Powered Resume Analysis
            </motion.div>

            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="text-5xl md:text-6xl font-bold text-[var(--color-text)] leading-tight"
              >
                Get AI-Powered
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] bg-clip-text text-transparent"
              >
                Resume Feedback
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed"
            >
              Our AI analyses your resume to help you stand out, pass ATS systems, and land more interviews — in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <a href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white px-7 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-[var(--color-primary)]/25 inline-flex items-center gap-2 hover:shadow-[var(--color-primary)]/40 transition-shadow"
                >
                  <FileText className="h-4 w-4" /> Analyse My Resume <ArrowRight className="h-4 w-4" />
                </motion.button>
              </a>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              {[['11', 'Analysis Areas'], ['< 30s', 'Report Time'], ['ATS', 'Optimised']].map(([n, l], i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-[var(--color-text)]">{n}</div>
                  <div className="text-[var(--color-text-muted)] text-xs mt-0.5">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — resume mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[58%] relative hidden lg:block"
          >
            <div className="relative">
              <ResumeMockup />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-surface-alt)] to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ══ HOW IT WORKS ══ */}
    <section className="bg-[var(--color-surface)] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Process</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)]">How It Works</h2>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)]" />
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10">
                <item.icon className="h-8 w-8 text-white" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-[var(--color-primary)] rounded-full text-[var(--color-primary)] text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--color-text)] mb-2">{item.title}</h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ BEFORE / AFTER ══ */}
    <section className="bg-[var(--color-surface-alt)] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Transformation</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3">Before &amp; After</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">See how AI suggestions turn a weak resume into a standout one</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-red-200 shadow-sm"
          >
            <div className="bg-red-50 px-5 py-3 flex items-center gap-2 border-b border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Before</span>
            </div>
            <div className="p-5 space-y-2 text-sm text-[var(--color-text-muted)]">
              <p className="font-semibold text-[var(--color-text)] text-sm">Software Engineer — Acme Corp (2021–2023)</p>
              <ul className="space-y-1.5 pl-4">
                {['Worked on the frontend team', 'Did some bug fixes and feature work', 'Helped with code reviews', 'Participated in meetings'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✗</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-green-200 shadow-sm"
          >
            <div className="bg-green-50 px-5 py-3 flex items-center gap-2 border-b border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">After</span>
            </div>
            <div className="p-5 space-y-2 text-sm text-[var(--color-text-muted)]">
              <p className="font-semibold text-[var(--color-text)] text-sm">Software Engineer — Acme Corp (2021–2023)</p>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Led frontend migration to React 18, reducing bundle size by 35%',
                  'Resolved 120+ bugs, improving app stability from 72% to 94%',
                  'Mentored 3 junior engineers through structured code review sessions',
                  'Drove sprint planning for a 6-person team, delivering 98% on-time',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ══ WHAT WE ANALYSE — bento ══ */}
    <section className="bg-[var(--color-surface)] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Analysis</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)]">What We Analyse</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="relative bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-2xl p-6 overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.color}`} />
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[var(--color-text)] mb-2 text-sm">{f.title}</h3>
              <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ 11 ANALYSIS AREAS ══ */}
    <section className="bg-[var(--color-surface-alt)] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Coverage</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3">Comprehensive Analysis</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">11 areas checked in every report</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {ANALYSIS_AREAS.map((area, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl px-4 py-3"
            >
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-[var(--color-text)]">{area}</span>
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
          <Zap className="h-14 w-14 mx-auto mb-6 text-white/80" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Improve Your Resume?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Get instant, actionable feedback to make your resume stand out and land more interviews.
          </p>
          <a href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
            >
              <FileText className="h-5 w-5" /> Upload Your Resume →
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>

  </div>
);

export default ResumeAnalysisPage;
