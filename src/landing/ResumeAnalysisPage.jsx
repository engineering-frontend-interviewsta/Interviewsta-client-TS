import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle, TrendingUp, Target, Sparkles, Search, Award, ArrowRight,
  Upload, ScanLine, ClipboardList, Lightbulb
} from 'lucide-react';

const SCORE_CARDS = [
  { label: 'ATS Score', score: 87, color: 'bg-green-500' },
  { label: 'Keyword Match', score: 72, color: 'bg-amber-500' },
  { label: 'Format Quality', score: 91, color: 'bg-green-500' },
  { label: 'Impact Score', score: 65, color: 'bg-amber-500' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: Upload,
    title: 'Upload Resume',
    description: 'Upload your PDF or Word document',
  },
  {
    step: '2',
    icon: ScanLine,
    title: 'AI Scans Content',
    description: 'Our AI analyzes every section in seconds',
  },
  {
    step: '3',
    icon: ClipboardList,
    title: 'Get Detailed Report',
    description: 'Receive scores across 11 analysis areas',
  },
  {
    step: '4',
    icon: Lightbulb,
    title: 'Apply Improvements',
    description: 'Follow actionable suggestions to improve',
  },
];

const ResumeAnalysisPage = () => {
  const features = [
    {
      icon: Search,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with keyword analysis and formatting suggestions',
    },
    {
      icon: Target,
      title: 'Content Review',
      description: 'Get feedback on your achievements, experience descriptions, and overall narrative',
    },
    {
      icon: Award,
      title: 'Impact Analysis',
      description: 'Learn how to quantify achievements and demonstrate your value to potential employers',
    },
    {
      icon: TrendingUp,
      title: 'Industry Alignment',
      description: 'Tailor your resume to match industry standards and role-specific requirements',
    },
  ];

  const analysisAreas = [
    'Keyword optimization for ATS systems',
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
            <FileText className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-[var(--color-primary)] font-medium">Resume Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
            Get AI-Powered
            <span className="block text-[var(--color-primary)]">Resume Feedback</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed mb-8">
            Our advanced AI analyzes your resume to help you stand out, pass ATS systems,
            and land more interviews.
          </p>
          <a href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Analyze Your Resume</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </a>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{item.title}</h3>
                <p className="text-[var(--color-text-muted)]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sample Report Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-4">Sample Report Preview</h2>
          <p className="text-[var(--color-text-muted)] text-center text-lg mb-10">
            Here's what your AI-generated resume report looks like
          </p>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-8 max-w-2xl mx-auto shadow-md">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">Resume Score Breakdown</h3>
            <div className="space-y-5">
              {SCORE_CARDS.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--color-text)]">{card.label}</span>
                    <span className="text-sm font-bold text-[var(--color-text)]">{card.score}/100</span>
                  </div>
                  <div className="w-full bg-[var(--color-border-light)] rounded-full h-2.5">
                    <div
                      className={`${card.color} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${card.score}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Before / After Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-4">Before &amp; After</h2>
          <p className="text-[var(--color-text-muted)] text-center text-lg mb-10">
            See how AI-powered suggestions transform a weak resume into a standout one
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[var(--color-surface)] border border-[var(--color-border-light)] border-l-4 border-l-red-400 rounded-[var(--radius-xl)] p-6 shadow-sm"
            >
              <span className="inline-block text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full mb-4">Before</span>
              <h3 className="font-semibold text-[var(--color-text)] mb-3">Work Experience</h3>
              <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <p className="font-medium text-[var(--color-text)]">Software Engineer — Acme Corp (2021–2023)</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Worked on the frontend team</li>
                  <li>Did some bug fixes and feature work</li>
                  <li>Helped with code reviews</li>
                  <li>Participated in meetings</li>
                </ul>
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[var(--color-surface)] border border-[var(--color-border-light)] border-l-4 border-l-green-400 rounded-[var(--radius-xl)] p-6 shadow-sm"
            >
              <span className="inline-block text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full mb-4">After</span>
              <h3 className="font-semibold text-[var(--color-text)] mb-3">Work Experience</h3>
              <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <p className="font-medium text-[var(--color-text)]">Software Engineer — Acme Corp (2021–2023)</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Led frontend migration to React 18, reducing bundle size by 35%</li>
                  <li>Resolved 120+ bugs, improving app stability score from 72% to 94%</li>
                  <li>Mentored 3 junior engineers through structured code review sessions</li>
                  <li>Drove sprint planning for a 6-person team, delivering 98% on-time</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* What We Analyze */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">What We Analyze</h2>
          <div className="grid md:grid-cols-2 gap-8">
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
                <h3 className="text-2xl font-semibold text-[var(--color-text)] mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comprehensive Analysis — 11 areas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-8 md:p-12 mb-20"
        >
          <h2 className="text-4xl font-bold text-[var(--color-text)] text-center mb-12">Comprehensive Analysis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {analysisAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-[var(--color-text)] text-lg">{area}</p>
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
          <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Improve Your Resume?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get instant, actionable feedback to make your resume stand out and land more interviews.
          </p>
          <a href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[var(--color-primary)] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Upload Your Resume</span>
            </motion.button>
          </a>
        </motion.div>

      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
