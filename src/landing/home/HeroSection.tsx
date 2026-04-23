import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterviewMockup from './InterviewMockup';

const stats = [
  { number: '5,000+', label: 'Interview Questions' },
  { number: '9+',     label: 'Interview Categories' },
  { number: '100+',   label: 'Interviews' },
  { number: '24/7',   label: 'AI Availability' },
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-[var(--color-surface-alt)]">
      {/* Ambient orbs */}
      <div aria-hidden className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-40 pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 items-center">

          {/* ── Left 40%: text + CTAs + stats ── */}
          <div className="w-full lg:w-[40%] space-y-7 pb-16 flex-shrink-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full px-5 py-2.5"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium">Powered by Empathetic AI</span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="text-5xl md:text-6xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] bg-clip-text text-transparent">
                  Master Your
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                className="text-5xl md:text-6xl font-bold text-[var(--color-text)] leading-tight"
              >
                Interview Skills
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed"
            >
              Practice with Glee, your AI interviewer. Get real feedback, build confidence, and land your dream job.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-[var(--radius-xl)] font-semibold text-sm shadow-[var(--shadow-lg)] transition-colors duration-200 inline-flex items-center gap-2"
              >
                Start Interview Practice <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary-light)] px-6 py-3 rounded-[var(--radius-xl)] font-semibold text-sm transition-colors duration-200"
              >
                View Dashboard
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 gap-5 pt-2"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-[var(--color-text)]">{stat.number}</div>
                  <div className="text-[var(--color-text-muted)] text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right 60%: live interview mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[60%] relative hidden lg:block"
          >
            <div className="absolute -inset-4 bg-[var(--color-primary-light)] rounded-3xl blur-2xl opacity-50 pointer-events-none" />
            <div className="relative">
              <InterviewMockup />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-surface-alt)] to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;
