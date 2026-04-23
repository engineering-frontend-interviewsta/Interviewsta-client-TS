import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Users, Terminal, Briefcase, MessageSquare,
  Mic, Target, Building2, BookOpen, Play,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

// ─── Thumbnail data (company + DSA + case study) ──────────────────────────────

interface ThumbItem {
  id: string;
  title: string;
  url: string;
  tag?: string;
}

const COMPANY_THUMBS: ThumbItem[] = [
  { id: 'it-10', title: 'Netflix',     url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/19dce45b-8cd4-4087-8249-d16d2611c08c/1774162880603-Netlfix.png.png',     tag: 'Hard' },
  { id: 'it-11', title: 'Amazon',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/5121da5b-0355-40df-88ac-dd7e12504ebe/1774162754258-Amazon1.png.png',      tag: 'Hard' },
  { id: 'it-12', title: 'Google',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/d176d73c-837c-44a0-931f-36f58b16ae9f/1774162829422-google.png.png',      tag: 'Hard' },
  { id: 'it-13', title: 'Microsoft',   url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/9cc73c25-29b5-4f67-8165-5eb36fa20f21/1774162868652-microsoft.png.png',   tag: 'Hard' },
  { id: 'it-14', title: 'IBM',         url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/1fe6ee46-72a3-41e3-a4c6-63a3f45d895f/1774162839868-ibm.png.png',         tag: 'Medium' },
  { id: 'it-15', title: 'Intel',       url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/6bdaa691-8a9d-4745-952b-d6f6ccb5638e/1774162848729-intel.png.png',       tag: 'Medium' },
  { id: 'it-16', title: 'SAP',         url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/204c7fef-6880-4b80-ab7e-649742611cd3/1774162972144-sap.png.png',         tag: 'Medium' },
  { id: 'it-17', title: 'Oracle',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/30f40a6d-b663-43c6-96da-85189f00eb03/1774162918160-oracle.png.png',      tag: 'Hard' },
  { id: 'it-18', title: 'Salesforce',  url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/132a1404-1e9f-4d17-8124-328c9c374173/1774162960284-salesforce.png.png',  tag: 'Hard' },
  { id: 'it-19', title: 'Flipkart',    url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/c107a5e0-8472-4f9b-81d5-7c32c5284017/1774162820000-flipkart.png.png',    tag: 'Hard' },
  { id: 'it-20', title: 'Zomato',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/e72436fd-db6c-47f5-aa17-63dd443d5a70/1774162999982-zomato.png.png',      tag: 'Hard' },
  { id: 'it-21', title: 'Swiggy',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/889568fb-8569-4dd6-bc10-d57af93ea8f2/1774162982640-swiggy.png.png',      tag: 'Hard' },
  { id: 'it-22', title: 'Paytm',       url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/98226fa6-5afd-4c5c-b623-b2e289bc478e/1774162935337-paytm.png.png',       tag: 'Medium' },
  { id: 'it-23', title: "Byju's",      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/a6eff72a-fa16-4568-b916-9bb7a85ea0b2/1774162808066-byjus.png.png',       tag: 'Medium' },
  { id: 'it-24', title: 'PhonePe',     url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/7d19c559-cdd7-4c44-8fb0-3f43c9d760f1/1774162946396-phonepe.png.png',     tag: 'Hard' },
  { id: 'it-25', title: 'Ola',         url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/ab563933-4972-4cd0-8cea-4341e386b10c/1774162895677-ola.png.png',         tag: 'Medium' },
  { id: 'it-26', title: 'Uber',        url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/324fecd6-29d7-4179-90b9-0150dcd224cc/1774162990755-uber.png.png',        tag: 'Hard' },
  { id: 'it-27', title: 'LinkedIn',    url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/bb0a6792-d758-46c3-8a8e-9e7e4e0a2383/1774162857511-linkedin.png.png',    tag: 'Hard' },
  { id: 'it-28', title: 'Accenture',   url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/01556074-2dbb-4021-b81a-e0ad49fb28e9/1774162442574-accenture.png.png',   tag: 'Medium' },
  { id: 'it-29', title: 'Infosys',     url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/af584668-91bc-4423-8ebe-2df4a80057ce/1774162721812-infosys.png.png',     tag: 'Medium' },
  { id: 'it-30', title: 'Capgemini',   url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/a7f9c9d5-33c8-4be8-bd19-d85d248073a7/1774162476000-capgemini.png.png',   tag: 'Medium' },
  { id: 'it-31', title: 'Cognizant',   url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/2abb4697-2f10-48dd-b92a-1ac93c60611e/1774162666475-cognizant.png.png',   tag: 'Medium' },
  { id: 'it-32', title: 'Deloitte',    url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/d20dc522-17d7-48c3-b229-a068f529278c/1774162695782-deloitte.png.png',    tag: 'Hard' },
  { id: 'it-33', title: 'EY',          url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/c133d0c2-f730-4401-a3b3-f249b8bba0b6/1774162713411-ey.png.png',          tag: 'Hard' },
  { id: 'it-34', title: 'KPMG',        url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/517124f4-b3ee-4e25-9d2e-5e7c59236182/1774162732559-kpmg.png.png',        tag: 'Hard' },
  { id: 'it-35', title: 'PwC',         url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/4bf37ff8-0e8d-4a4d-b5cd-5015a7e3cbcd/1774162746546-pwc.png.png',         tag: 'Hard' },
];

const DSA_THUMBS: ThumbItem[] = [
  { id: 'it-38', title: 'Arrays · 1',            url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-38/1776000307335-arrays1.png.png',         tag: 'Arrays' },
  { id: 'it-39', title: 'Arrays · 2',            url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-39/1776000458343-arrays2.png.png',         tag: 'Arrays' },
  { id: 'it-40', title: 'Arrays · 3',            url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-40/1776000654461-arrays3.png.png',         tag: 'Arrays' },
  { id: 'it-41', title: 'Strings · 1',           url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-41/1776000410064-strings1.png.png',        tag: 'Strings' },
  { id: 'it-42', title: 'Strings · 2',           url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-42/1776000585382-strings2.png.png',        tag: 'Strings' },
  { id: 'it-43', title: 'Strings · 3',           url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-43/1776000740495-strings3.png.png',        tag: 'Strings' },
  { id: 'it-44', title: 'Dynamic Prog · 1',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-44/1776000450029-dp1.png.png',             tag: 'DP' },
  { id: 'it-45', title: 'Dynamic Prog · 2',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-45/1776000661215-dp2.png.png',             tag: 'DP' },
  { id: 'it-46', title: 'Trees · 1',             url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-46/1776000432846-trees1.png.png',          tag: 'Trees' },
  { id: 'it-47', title: 'Trees · 2',             url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-47/1776000647713-trees2.png.png',          tag: 'Trees' },
  { id: 'it-48', title: 'Trees · 3',             url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-48/1776000750381-trees3.png.png',          tag: 'Trees' },
  { id: 'it-49', title: 'Linked Lists · 1',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-49/1776000354822-linkedlist1.png.png',     tag: 'Linked Lists' },
  { id: 'it-50', title: 'Linked Lists · 2',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-50/1776000556383-linkedlist2.png.png',     tag: 'Linked Lists' },
  { id: 'it-51', title: 'Stacks & Queues · 1',   url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-51/1776000396531-stackqueues1.png.png',   tag: 'Stacks' },
  { id: 'it-52', title: 'Stacks & Queues · 2',   url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-52/1776000569630-stackqueues2.png.png',   tag: 'Stacks' },
  { id: 'it-53', title: 'Heaps · 1',             url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-53/1776000490131-heaps1.png.png',          tag: 'Heaps' },
  { id: 'it-54', title: 'Heaps · 2',             url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-54/1776000726242-heaps2.png.png',          tag: 'Heaps' },
  { id: 'it-36', title: 'Graphs · 1',            url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-36/1776001276855-graph1.png.png',          tag: 'Graphs' },
  { id: 'it-37', title: 'Graphs · 2',            url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-37/1776000676255-graph2.png.png',          tag: 'Graphs' },
];

const CASE_STUDY_THUMBS: ThumbItem[] = [
  { id: 'it-65', title: 'From Menu to Home',    url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-65/1776000174466-Zomato_fromrestauranttodoorstep.png.png',          tag: 'Zomato' },
  { id: 'it-66', title: 'Hunger Games',         url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-66/1776000187467-SwiggyscalesdeliverywithInstamart.png.png',         tag: 'Swiggy' },
  { id: 'it-67', title: 'Pay Day',              url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-67/1776002760137-CREDcommunityandrewardsinfocus.png.png',             tag: 'CRED' },
  { id: 'it-68', title: 'Resale Royale',        url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-68/1776000069026-ResalesuccesswithMeeshosplatform.png.png',           tag: 'Meesho' },
  { id: 'it-69', title: '10 Minutes to Glory',  url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-69/1776000198265-zeptrocasestudy.png.png',                            tag: 'Zepto' },
  { id: 'it-70', title: 'Class Dismissed',      url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-70/1776000125050-Byjusliquiditycrisiscasestudy.png.png',              tag: "Byju's" },
  { id: 'it-71', title: 'Ride or Die',          url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-71/1776000254901-Olaride-hailingvselectricfuture.png.png',            tag: 'Ola' },
  { id: 'it-72', title: 'Cart Before the Horse',url: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/interview-test-thumbnails/it-72/1776000046092-FlipkartWalmartandAmazoncomparison.png.png',          tag: 'Flipkart' },
];

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



// ─── Infinite CSS-based marquee (no framer-motion translate bugs) ─────────────
// Uses a keyframe injected once; pure CSS animation = perfectly seamless loop.

const MARQUEE_STYLE_ID = 'ica-marquee-styles';

function ensureMarqueeStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(MARQUEE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = MARQUEE_STYLE_ID;
  style.textContent = `
    @keyframes marquee-left  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
    .marquee-left  { animation: marquee-left  var(--marquee-dur, 40s) linear infinite; }
    .marquee-right { animation: marquee-right var(--marquee-dur, 40s) linear infinite; }

  `;
  document.head.appendChild(style);
}

interface MarqueeRowProps {
  items: React.ReactNode[];
  reverse?: boolean;
  duration?: number; // seconds
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ items, reverse = false, duration = 38 }) => {
  React.useEffect(() => { ensureMarqueeStyles(); }, []);
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex gap-4 w-max ${reverse ? 'marquee-right' : 'marquee-left'}`}
        style={{ '--marquee-dur': `${duration}s` } as React.CSSProperties}
      >
        {doubled}
      </div>
    </div>
  );
};

// ─── Category card ────────────────────────────────────────────────────────────

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

// ─── Unified thumbnail card (same look for all three strips) ─────────────────

const ThumbCard: React.FC<{ item: ThumbItem; subLabel?: string }> = ({ item, subLabel }) => (
  <div className="flex-shrink-0 w-80 rounded-2xl overflow-hidden border border-[var(--color-border-light)] shadow-sm group cursor-pointer hover:shadow-xl transition-shadow duration-300">
    <div className="relative w-full h-52 overflow-hidden">
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* tag pill */}
      {item.tag && (
        <div className="absolute top-3 left-3">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/30">
            {item.tag}
          </span>
        </div>
      )}
      {/* play button on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
          <Play className="h-5 w-5 text-[var(--color-primary)] ml-0.5" />
        </div>
      </div>
      {/* title at bottom */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white font-bold text-sm leading-tight">{item.title}</p>
        <p className="text-white/70 text-xs mt-0.5">{subLabel ?? 'Interview'}</p>
      </div>
    </div>
  </div>
);

// ─── Main section ─────────────────────────────────────────────────────────────

const InterviewCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[var(--color-surface)] py-20 overflow-hidden">

      {/* constrained header + cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section header ── */}
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

        {/* ── Category Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {INTERVIEW_CATEGORIES.map((card, index) => (
            <CategoryCardItem key={card.title} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* ── Company Library — single full-width marquee ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[var(--color-text)]">Company Library</h3>
            <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full">
              {COMPANY_THUMBS.length}
            </span>
          </div>
        </div>
        <MarqueeRow
          duration={109}
          items={COMPANY_THUMBS.map((item) => (
            <ThumbCard key={item.id} item={item} subLabel="Company Interview" />
          ))}
        />
      </motion.div>

      {/* ── DSA Subjects — full-width single marquee ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <h3 className="text-xl font-bold text-[var(--color-text)]">DSA Subjects</h3>
        </div>
        <MarqueeRow
          duration={80}
          reverse
          items={DSA_THUMBS.map((item) => (
            <ThumbCard key={item.id} item={item} subLabel="DSA Interview" />
          ))}
        />
      </motion.div>

      {/* ── Case Studies — full-width cinematic marquee ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[var(--color-text)]">Case Studies</h3>
          </div>
        </div>
        <MarqueeRow
          duration={34}
          items={CASE_STUDY_THUMBS.map((item) => (
            <ThumbCard key={item.id} item={item} subLabel="Case Study Interview" />
          ))}
        />
      </motion.div>

      {/* ── CTA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
