/** Minimal list for type selection; can be replaced by API later */
export interface InterviewTypeOption {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  questions: number;
}

export const INTERVIEW_TYPE_OPTIONS: InterviewTypeOption[] = [
  { id: 'technical', title: 'Technical', category: 'Technical', difficulty: 'Medium', duration: 45, questions: 5 },
  { id: 'hr', title: 'HR', category: 'HR', difficulty: 'Medium', duration: 30, questions: 4 },
  { id: 'coding', title: 'Coding', category: 'Coding', difficulty: 'Medium', duration: 60, questions: 2 },
  { id: 'case-study', title: 'Case Study', category: 'Case Study', difficulty: 'Medium', duration: 45, questions: 3 },
  { id: 'communication', title: 'Communication', category: 'Communication', difficulty: 'Medium', duration: 25, questions: 4 },
  { id: 'debate', title: 'Debate', category: 'Debate', difficulty: 'Medium', duration: 30, questions: 2 },
  { id: 'role-based', title: 'Role-Based', category: 'Role-Based Interview', difficulty: 'Medium', duration: 45, questions: 5 },
  { id: 'company', title: 'Company', category: 'Company', difficulty: 'Medium', duration: 45, questions: 5 },
  { id: 'subject', title: 'Subject', category: 'Subject', difficulty: 'Medium', duration: 45, questions: 5 },
];

// ── Tag constants ─────────────────────────────────────────────────────────────

/** Value present in InterviewTest.topics[] that identifies company growth story tests. */
export const COMPANY_GROWTH_TAG = 'company-growth' as const;

/** Value present in InterviewTest.topics[] that identifies consulting topic tests. */
export const CONSULTING_TOPIC_TAG = 'consulting-topic' as const;

// ── Consulting Topics ─────────────────────────────────────────────────────────

export interface ConsultingTopic {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly frameworks: readonly string[];
}

export const CONSULTING_TOPICS_LIST: readonly ConsultingTopic[] = [
  {
    slug: 'profitability',
    name: 'Profitability',
    description: 'Diagnose declining margins and build a structured path back to profit.',
    frameworks: ['Revenue Tree', 'Cost Tree', 'Contribution Margin Analysis'],
  },
  {
    slug: 'market-entry',
    name: 'Market Entry',
    description: 'Evaluate whether and how a company should enter a new market or geography.',
    frameworks: ['Market Attractiveness', 'Competitive Positioning', 'Build / Buy / Partner'],
  },
  {
    slug: 'growth-strategy',
    name: 'Growth Strategy',
    description: 'Identify and prioritise levers to accelerate sustainable growth.',
    frameworks: ['Ansoff Matrix', 'Growth Accounting', 'CAC / LTV Analysis'],
  },
  {
    slug: 'mergers-acquisitions',
    name: 'Mergers & Acquisitions',
    description: 'Assess strategic rationale, synergies, valuation, and integration risk for a deal.',
    frameworks: ['Strategic Fit', 'Synergy Quantification', 'Valuation Sanity Check'],
  },
  {
    slug: 'operations-cost',
    name: 'Operations & Cost',
    description: 'Map processes, find bottlenecks, and build a prioritised cost-reduction plan.',
    frameworks: ['Process Mapping', 'Fixed vs Variable Cost', 'Quick Wins vs Structural Fixes'],
  },
  {
    slug: 'pricing-strategy',
    name: 'Pricing Strategy',
    description: 'Analyse pricing decisions and model the revenue impact of a pricing change.',
    frameworks: ['Value-Based Pricing', 'Competitive Pricing', 'Price Elasticity Modelling'],
  },
  {
    slug: 'product-innovation',
    name: 'Product & Innovation',
    description: 'Size opportunities, prioritise features, and recommend a build-or-kill decision.',
    frameworks: ['RICE Prioritisation', 'Customer Need Mapping', 'Opportunity Sizing'],
  },
  {
    slug: 'turnaround-crisis',
    name: 'Turnaround & Crisis',
    description: 'Stabilise a business in distress and build a 30/60/90-day recovery plan.',
    frameworks: ['Cash Flow Triage', 'Root Cause Diagnosis', 'Stakeholder Management'],
  },
] as const;

// ── Company Growth Stories ────────────────────────────────────────────────────

export interface CompanyGrowthStory {
  readonly slug: string;
  readonly displayName: string;
  readonly funTitle: string;
  readonly tagline: string;
}

/**
 * Mirrors the InterviewTest records seeded in the DB.
 * Used by VideoInterview to identify company-growth tests and build the correct payload.
 */
export const COMPANY_GROWTH_STORIES: readonly CompanyGrowthStory[] = [
  {
    slug: 'zomato',
    displayName: 'Zomato',
    funTitle: 'From Menu to Home',
    tagline: 'From restaurant discovery to food delivery giant.',
  },
  {
    slug: 'swiggy',
    displayName: 'Swiggy',
    funTitle: 'Hunger Games',
    tagline: 'Scaling food delivery and 10-minute grocery across India.',
  },
  {
    slug: 'cred',
    displayName: 'CRED',
    funTitle: 'Pay Day',
    tagline: 'Building a premium credit card community.',
  },
  {
    slug: 'meesho',
    displayName: 'Meesho',
    funTitle: 'Resale Royale',
    tagline: 'Disrupting e-commerce for Tier-2 and Tier-3 India.',
  },
  {
    slug: 'zepto',
    displayName: 'Zepto',
    funTitle: '10 Minutes to Glory',
    tagline: 'Building 10-minute grocery delivery from scratch.',
  },
  {
    slug: 'byjus',
    displayName: "Byju's",
    funTitle: 'Class Dismissed',
    tagline: 'Rise to $22B and the subsequent liquidity crisis.',
  },
  {
    slug: 'ola',
    displayName: 'Ola',
    funTitle: 'Ride or Die',
    tagline: 'Ride-hailing dominance and the Ola Electric bet.',
  },
  {
    slug: 'flipkart',
    displayName: 'Flipkart',
    funTitle: 'Cart Before the Horse',
    tagline: "India's largest e-commerce platform and the Walmart acquisition.",
  },
] as const;
