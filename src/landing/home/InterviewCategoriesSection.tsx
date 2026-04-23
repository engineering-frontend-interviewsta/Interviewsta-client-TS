import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Users, Terminal, Briefcase, MessageSquare,
  Mic, Target, Building2, BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  COMPANY_THUMBS, DSA_THUMBS, CASE_STUDY_THUMBS,
  ThumbCard, MarqueeRow,
} from './VideoInterviewsShared';

// ─── Category cards data ──────────────────────────────────────────────────────

interface CategoryCard {
  icon: LucideIcon;
  title: string;
  description: string;
  topics: string[];
  duration: number;
}

const INTERVIEW_CATEGORIES: CategoryCard[] = [
  {
    icon: Code2,
    title: 'Technical Interview',
    description: 'In-depth technical skills assessment covering algorithms, data structures, and system design.',
    topics: ['Coding Problems', 'Algorithm Design', 'System Design'],
    duration: 45,
  },
  {
    icon: Users,
    title: 'HR / Behavioral',
    description: 'Behavioral assessment focusing on soft skills, cultural fit, and career motivations.',
    topics: ['Behavioral Questions', 'Cultural Fit', 'Career Goals'],
    duration: 30,
  },
  {
    icon: Terminal,
    title: 'Coding / DSA',
    description: 'Deep-dive into data structures and algorithms with live coding challenges.',
    topics: ['Arrays', 'Graphs', 'Dynamic Programming'],
    duration: 60,
  },
  {
    icon: Briefcase,
    title: 'Case Study',
    description: 'Analyze real-world business scenarios and develop problem-solving skills.',
    topics: ['Business Analysis', 'Decision Making', 'Problem Solving'],
    duration: 60,
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    description: 'Assess speaking proficiency, comprehension, vocabulary, and sentence construction.',
    topics: ['Speaking Skills', 'Comprehension', 'Vocabulary'],
    duration: 30,
  },
  {
    icon: Mic,
    title: 'Debate',
    description: 'Evaluate argumentation structure, logical reasoning, and persuasion skills.',
    topics: ['Argumentation', 'Persuasion', 'Logical Reasoning'],
    duration: 35,
  },
  {
    icon: Target,
    title: 'Role-Based',
    description: 'Role-specific interviews for Frontend, Backend, UI/UX, AI/ML, and Data Science.',
    topics: ['Frontend', 'Backend', 'AI/ML'],
    duration: 45,
  },
  {
    icon: Building2,
    title: 'Company-Specific',
    description: 'Targeted preparation for Google, Amazon, Netflix, Meta, Apple, and more.',
    topics: ['Company Culture', 'Technical Rounds', 'Leadership Principles'],
    duration: 60,
  },
  {
    icon: BookOpen,
    title: 'Subject-Specific',
    description: 'Deep-dive into specific DSA subjects: Arrays, Strings, Trees, Graphs, and more.',
    topics: ['Arrays', 'Trees', 'Graphs'],
    duration: 45,
  },
];


// ─── Main section ─────────────────────────────────────────────────────────────

interface CategoryCardItemProps {
  card: CategoryCard;
  index: number;
}

const CategoryCardItem: React.FC<CategoryCardItemProps> = ({ card, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      data-testid="category-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:border-[var(--color-primary)] rounded-[var(--radius-xl)] p-6 cursor-pointer overflow-hidden transition-colors duration-200"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Base content — always visible */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-lg)] flex items-center justify-center flex-shrink-0">
          <card.icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text)] text-base">{card.title}</h3>
          <p className="text-[var(--color-text-muted)] text-sm mt-1 leading-relaxed">
            {card.description}
          </p>
        </div>
      </div>

      {/* Hover overlay — blurred backdrop, topics + duration */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-[var(--radius-xl)] backdrop-blur-sm bg-[var(--color-surface)]/80 flex flex-col justify-center px-6 gap-4"
          >
            <div className="flex flex-wrap gap-2">
              {card.topics.map((topic) => (
                <span key={topic} className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {topic}
                </span>
              ))}
            </div>
            <span className="text-[var(--color-text-subtle)] text-xs">~{card.duration} min</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────

const InterviewCategoriesSection: React.FC = () => {
  return (
    <section className="overflow-hidden">

      {/* ── Header + Category Cards — full-width surface band ── */}
      <div className="bg-[var(--color-surface)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Interview Library
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
              Everything You Need to Prepare
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
              9 interview types, 100+ interviews, and hundreds of DSA topics — all in one place.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTERVIEW_CATEGORIES.map((card, index) => (
              <CategoryCardItem key={card.title} card={card} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Company Library — full-width surface-alt band ── */}
      <div className="bg-[var(--color-surface-alt)] py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Company Library</span>
            <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">Practice for Top Companies</h3>
            <p className="text-[var(--color-text-muted)] text-base">Company-specific interview tracks with real-world questions</p>
          </div>
          <MarqueeRow
            duration={109}
            items={COMPANY_THUMBS.map((item) => (
              <ThumbCard key={item.id} item={item} subLabel="Company Interview" />
            ))}
          />
        </motion.div>
      </div>

      {/* ── DSA Subjects — full-width surface band ── */}
      <div className="bg-[var(--color-surface)] py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">DSA</span>
            <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">Data Structures & Algorithms</h3>
            <p className="text-[var(--color-text-muted)] text-base">Deep-dive sessions on every core DSA topic</p>
          </div>
          <MarqueeRow
            duration={80}
            reverse
            items={DSA_THUMBS.map((item) => (
              <ThumbCard key={item.id} item={item} subLabel="DSA Interview" />
            ))}
          />
        </motion.div>
      </div>

      {/* ── Case Studies — full-width surface-alt band ── */}
      <div className="bg-[var(--color-surface-alt)] py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Case Studies</span>
            <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">Indian Startup Case Studies</h3>
            <p className="text-[var(--color-text-muted)] text-base">Real business scenarios from India's most iconic startups</p>
          </div>
          <MarqueeRow
            duration={34}
            items={CASE_STUDY_THUMBS.map((item) => (
              <ThumbCard key={item.id} item={item} subLabel="Case Study Interview" />
            ))}
          />
        </motion.div>
      </div>

    </section>
  );
};

export default InterviewCategoriesSection;
