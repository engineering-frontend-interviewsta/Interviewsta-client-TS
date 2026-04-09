import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stats = [
  { number: '10,000+', label: 'Interview Questions' },
  { number: '9+', label: 'Interview Categories' },
  { number: '20+', label: 'Company Tracks' },
  { number: '24/7', label: 'AI Availability' },
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-[var(--color-surface-alt)]">
      {/* Decorative orb */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-40 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="text-center space-y-8">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full px-6 py-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
              className="text-sm font-medium overflow-hidden whitespace-nowrap"
            >
              Powered by Empathetic AI
            </motion.span>
          </motion.div>

          {/* Headline */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-5xl md:text-7xl font-bold"
            >
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-muted)] bg-clip-text text-transparent">
                Master Your
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="text-5xl md:text-7xl font-bold text-[var(--color-text)]"
            >
              Interview Skills
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed"
            >
              Prepare for your dream job with AI-powered interview practice,
              personalized coaching, and comprehensive skill assessments.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-[var(--radius-xl)] font-semibold text-lg shadow-[var(--shadow-lg)] transition-colors duration-200"
            >
              Start Interview Practice →
            </motion.button>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary-light)] px-8 py-4 rounded-[var(--radius-xl)] font-semibold text-lg transition-colors duration-200"
            >
              View Dashboard
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                className="text-center cursor-pointer"
              >
                <div className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                  {stat.number}
                </div>
                <div className="text-[var(--color-text-muted)] text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
