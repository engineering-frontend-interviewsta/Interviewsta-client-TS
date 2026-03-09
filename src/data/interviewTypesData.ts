/**
 * Full list of interview types: companies, DSA subjects, interview types, role-based.
 * Sourced from legacy Data/interviewTypes.json + role-based list for backend parity.
 */
import type { InterviewTypeEntry } from '../types/interviewTypes';

import interviewTypesJson from './interviewTypes.json';

const jsonList = interviewTypesJson as InterviewTypeEntry[];

/** Role-based options (ids 30–34 match backend); not in main JSON. */
const ROLE_BASED: InterviewTypeEntry[] = [
  { id: 30, title: 'Frontend Development', category: 'role-wise', difficulty: 'Medium', questions: null, duration: 45, description: 'Frontend development interview covering HTML, CSS, JavaScript, React, and modern web development.', topics: ['HTML/CSS', 'JavaScript', 'React', 'State Management'], company: null, subject: null, interview_mode: 'Role-Based Interview', is_active: true, role: 'Frontend Development' },
  { id: 31, title: 'Backend Development', category: 'role-wise', difficulty: 'Medium', questions: null, duration: 45, description: 'Backend development interview focusing on server-side programming, APIs, databases, and system design.', topics: ['APIs', 'Databases', 'Authentication', 'Microservices'], company: null, subject: null, interview_mode: 'Role-Based Interview', is_active: true, role: 'Backend Development' },
  { id: 32, title: 'UI/UX Design', category: 'role-wise', difficulty: 'Medium', questions: null, duration: 40, description: 'UI/UX design interview assessing design principles, user research, prototyping, and design thinking.', topics: ['Design Principles', 'User Research', 'Prototyping', 'Accessibility'], company: null, subject: null, interview_mode: 'Role-Based Interview', is_active: true, role: 'UI/UX Design' },
  { id: 33, title: 'AI/ML', category: 'role-wise', difficulty: 'Hard', questions: null, duration: 50, description: 'AI/ML interview covering machine learning fundamentals, deep learning, and practical ML applications.', topics: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'], company: null, subject: null, interview_mode: 'Role-Based Interview', is_active: true, role: 'AI/ML' },
  { id: 34, title: 'Data Science', category: 'role-wise', difficulty: 'Medium', questions: null, duration: 45, description: 'Data science interview focusing on statistics, data analysis, visualization, and data-driven decision making.', topics: ['Statistics', 'Data Analysis', 'SQL', 'Data Visualization'], company: null, subject: null, interview_mode: 'Role-Based Interview', is_active: true, role: 'Data Science' },
];

/** All options: JSON list + role-based. Filter to active only. */
export const ALL_INTERVIEW_OPTIONS: InterviewTypeEntry[] = [
  ...jsonList.filter((e) => e.is_active !== false),
  ...ROLE_BASED,
];

/** Backend interview type string sent to start interview API */
export function getBackendInterviewType(entry: InterviewTypeEntry): string {
  const cat = (entry.category || '').toLowerCase();
  const mode = (entry.interview_mode || '').toLowerCase();

  if (cat === 'company-wise') return 'Company';
  if (cat === 'subject-wise' || cat === 'topic-wise') return 'Subject';
  if (cat === 'role-wise') return 'Role-Based Interview';
  if (cat === 'case-study-wise') return 'CaseStudy';
  if (mode.includes('technical')) return 'Technical';
  if (mode.includes('hr') || mode.includes('behavioral')) return 'HR';
  if (mode.includes('case study')) return 'CaseStudy';
  if (mode.includes('communication')) return 'Communication';
  if (mode.includes('debate')) return 'Debate';
  return 'Technical';
}

/** Payload sent to start interview API (interview_type_id, company, subject, role) */
export function getBackendPayload(entry: InterviewTypeEntry): Record<string, unknown> {
  const type = getBackendInterviewType(entry);
  const payload: Record<string, unknown> = { interview_type_id: entry.id };

  if (type === 'Company' && entry.company) payload.company = entry.company;
  if (type === 'Subject' && entry.subject) payload.subject = entry.subject;
  if (type === 'Role-Based Interview' && entry.role) payload.role = entry.role;
  if (type === 'Technical' || type === 'HR') return {}; // no id needed for generic Technical/HR
  return payload;
}

export type { InterviewTypeEntry };
