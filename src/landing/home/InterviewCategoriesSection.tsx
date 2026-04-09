import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Users,
  Terminal,
  Briefcase,
  MessageSquare,
  Mic,
  Target,
  Building2,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ALL_INTERVIEW_OPTIONS } from '../../data/interviewTypesData';
import type { LucideIcon } from 'lucide-react';

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

const DSA_CHIPS = [
  'Arrays', 'Strings', 'Graphs', 'Trees', 'Linked Lists',
  'Stacks & Queues', 'Heaps', 'Dynamic Programming',
];

const ROLE_CHIPS = [
  'Frontend Development', 'Backend Development', 'UI/UX Design', 'AI/ML', 'Data Science',
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

interface CategoryCardItemProps {
  card: CategoryCard;
  index: number;
}

const CategoryCardItem: React.FC<CategoryCardItemProps> = ({ card, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      data-testid="category-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 cursor-pointer overflow-hidden"
      style={{ boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)' }}
    >
      <div className="flex items-start gap-4 mb-3">
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

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[var(--color-border-light)]">
              <div className="flex flex-wrap gap-2 mb-2">
                {card.topics.map((topic) => (
                  <span
                    key={topic}
                    className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <span className="text-[var(--color-text-subtle)] text-xs">
                ~{card.duration} min
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InterviewCategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const companies = ALL_INTERVIEW_OPTIONS.filter((e) => e.category === 'company-wise');

  return (
    <section className="bg-[var(--color-surface-alt)] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
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
            9 interview types, 20+ company tracks, and hundreds of DSA topics — all in one place.
          </p>
        </motion.div>

        {/* 9 Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {INTERVIEW_CATEGORIES.map((card, index) => (
            <CategoryCardItem key={card.title} card={card} index={index} />
          ))}
        </div>

        {/* Company Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-[var(--color-text)]">Company Library</h3>
            <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full">
              {companies.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {companies.map((company) => (
              <div
                key={company.id}
                data-testid="company-badge"
                className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] px-3 py-2"
              >
                <span className="text-[var(--color-text)] text-sm font-medium">
                  {company.company ?? company.title}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    difficultyColors[company.difficulty] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {company.difficulty}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* DSA Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">DSA Subjects</h3>
          <div className="flex flex-wrap gap-3">
            {DSA_CHIPS.map((chip) => (
              <span
                key={chip}
                className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Role-Based Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Role-Based Tracks</h3>
          <div className="flex flex-wrap gap-3">
            {ROLE_CHIPS.map((chip) => (
              <span
                key={chip}
                className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/video-interviews')}
            className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-[var(--radius-xl)] font-semibold text-lg hover:bg-[var(--color-primary-hover)] transition-colors duration-200 shadow-[var(--shadow-md)]"
          >
            Browse All Interview Types →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default InterviewCategoriesSection;
