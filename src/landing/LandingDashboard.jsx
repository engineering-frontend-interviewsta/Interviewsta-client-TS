import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, TrendingUp, Target, Calendar, Award, Clock,
  CheckCircle, Zap, Brain, ArrowRight, Star, MessageSquare, History
} from 'lucide-react';

// Mock session history for the dashboard preview
const MOCK_SESSIONS = [
  { date: 'Dec 18, 2024', type: 'Technical Interview', score: 84 },
  { date: 'Dec 15, 2024', type: 'HR Interview', score: 91 },
  { date: 'Dec 12, 2024', type: 'System Design', score: 76 },
];

// Bar chart heights (decorative)
const BAR_HEIGHTS = [55, 70, 45, 85, 65];

// "What You'll Track" items
const TRACK_ITEMS = [
  {
    icon: BarChart3,
    title: 'Overall Performance Score',
    description: 'A single composite score that reflects your readiness across all interview types.',
  },
  {
    icon: Target,
    title: 'Interview Scores by Category',
    description: 'Drill down into technical, behavioral, and case study performance separately.',
  },
  {
    icon: TrendingUp,
    title: 'Skill Progression Over Time',
    description: 'Visual trend lines showing how your skills have improved session by session.',
  },
  {
    icon: History,
    title: 'Session History with Transcripts',
    description: 'Full replay of every session including AI feedback and conversation transcripts.',
  },
  {
    icon: Brain,
    title: 'AI Recommendations from Glee',
    description: 'Personalized next-step suggestions from Glee based on your weak areas.',
  },
];

// Free vs Paid features
const FREE_FEATURES = [
  '3 practice sessions / month',
  'Basic AI feedback',
  'Session history (7 days)',
];

const PAID_FEATURES = [
  'Unlimited sessions',
  'Detailed AI feedback',
  'Full session history',
  'Priority support',
  'Advanced analytics',
];

const LandingDashboard = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed charts and metrics showing improvement over time',
      details: ['Interview scores by category', 'Skill progression graphs', 'Time-based trends', 'Comparative benchmarks'],
    },
    {
      icon: Target,
      title: 'Personalized Goals',
      description: 'Set and track custom goals tailored to your interview preparation journey',
      details: ['Custom milestones', 'Progress tracking', 'Achievement badges', 'Deadline reminders'],
    },
    {
      icon: Calendar,
      title: 'Session History',
      description: 'Review all your practice sessions with complete transcripts and feedback',
      details: ['Full interview recordings', 'Detailed transcripts', 'AI feedback reports', 'Performance comparisons'],
    },
    {
      icon: Brain,
      title: 'AI Recommendations',
      description: 'Get personalized suggestions from Glee on what to practice next',
      details: ['Weak area identification', 'Targeted practice plans', 'Resource recommendations', 'Learning paths'],
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Earn badges and certifications as you master different interview skills',
      details: ['Skill certifications', 'Milestone badges', 'Completion streaks', 'Leaderboard rankings'],
    },
    {
      icon: Clock,
      title: 'Study Plans',
      description: 'Follow structured learning paths designed to prepare you for specific roles',
      details: ['Role-specific curricula', 'Daily practice schedules', 'Progress checkpoints', 'Adaptive difficulty'],
    },
  ];

  const benefits = [
    'All your practice sessions in one centralized location',
    'Visual progress tracking with intuitive charts',
    'Personalized insights from Glee, your AI coach',
    'Quick access to all interview preparation tools',
    'Performance comparisons across multiple sessions',
    'Export reports for offline review',
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] rounded-full px-6 py-2 mb-6">
            <LayoutDashboard className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-[var(--color-primary)] font-medium">Dashboard</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
            Your Command Center for
            <span className="block text-[var(--color-primary)]">Interview Success</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed mb-8">
            Track your progress, analyze performance, and get personalized insights all in one powerful
            dashboard designed to accelerate your interview preparation.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Mock Dashboard UI Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-4">Dashboard Preview</h2>
          <p className="text-[var(--color-text-muted)] text-center text-lg mb-10">
            A glimpse of your personalized performance hub
          </p>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-6 shadow-md max-w-3xl mx-auto">
            {/* Overall Score Card */}
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-[var(--color-primary)] text-white rounded-[var(--radius-xl)] p-6 flex flex-col items-center min-w-[120px]">
                <span className="text-5xl font-bold leading-none">87</span>
                <span className="text-xs mt-2 opacity-80 font-medium">Overall Score</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Your readiness score</p>
                <div className="w-full bg-[var(--color-border-light)] rounded-full h-3 mb-3">
                  <div
                    className="bg-[var(--color-primary)] h-3 rounded-full"
                    style={{ width: '87%' }}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Top 15% of all candidates this week</p>
              </div>
            </div>

            {/* Bar Chart Placeholder */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[var(--color-text)] mb-3">Score Trend (Last 5 Sessions)</p>
              <div className="flex items-end gap-3 h-20">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${h}%`,
                      backgroundColor: `rgba(109, 40, 217, ${0.4 + i * 0.12})`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['Dec 1', 'Dec 5', 'Dec 9', 'Dec 14', 'Dec 18'].map((d) => (
                  <span key={d} className="text-xs text-[var(--color-text-muted)]">{d}</span>
                ))}
              </div>
            </div>

            {/* Session History */}
            <div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-3">Recent Sessions</p>
              <div className="space-y-2">
                {MOCK_SESSIONS.map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[var(--color-surface-alt)] rounded-lg px-4 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{session.type}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{session.date}</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-primary)]">{session.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Features */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Dashboard Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-8 shadow-md"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-[var(--color-text-muted)]">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What You'll Track */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">What You'll Track</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRACK_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-sm flex gap-4"
              >
                <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Free vs Paid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-4">Free vs. Paid</h2>
          <p className="text-[var(--color-text-muted)] text-center text-lg mb-10">
            Start free, upgrade when you're ready
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6"
            >
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">Free</h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-5">Get started at no cost</p>
              <ul className="space-y-3">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Paid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[var(--color-primary)] text-white rounded-[var(--radius-xl)] p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">Pro</h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Popular</span>
              </div>
              <p className="text-white/70 text-sm mb-5">Everything you need to land the job</p>
              <ul className="space-y-3">
                {PAID_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Why Use the Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-8 md:p-12 mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Why Use the Dashboard?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start space-x-3"
              >
                <TrendingUp className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-[var(--color-text)] text-lg">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] rounded-2xl p-12 text-center text-white"
        >
          <LayoutDashboard className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Start Tracking Your Progress</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Access your personalized dashboard now and take control of your interview preparation journey.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Open Dashboard</span>
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default LandingDashboard;
