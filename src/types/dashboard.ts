/** Interview type keys from analytics API (latest-stats, performance) */
export const INTERVIEW_TYPE_KEYS = [
  'technical',
  'behavioral',
  'role-based',
  'case-study',
  'debate',
  'specialised',
  'miscellaneous',
] as const;
export type InterviewTypeKey = (typeof INTERVIEW_TYPE_KEYS)[number];

/** Per-type stats in latest-stats diffLastWeek (duration string "HH:MM:SS", score number) */
export interface LatestStatsTypePoint {
  duration: string;
  score: number;
}

/** Latest-stats API response (performance trend: this week vs last week) */
export interface LatestStatsResponse {
  totalSessions: number;
  overallAvg: number;
  finalRank: number;
  diffLastWeek: {
    currentWeek: Record<InterviewTypeKey, LatestStatsTypePoint>;
    prevWeek: Record<InterviewTypeKey, LatestStatsTypePoint>;
  };
  /** ISO date string for start of current week (e.g. "2026-03-09") */
  currentWeekStartDate?: string;
  /** ISO date string for start of previous week (e.g. "2026-03-02") */
  prevWeekStartDate?: string;
}

/** Per-type stats in performance API */
export interface PerformanceTypePoint {
  totalSessions: number;
  averageScore: number;
}

/** Performance API response (overall per interview type) */
export type PerformanceResponse = Record<InterviewTypeKey, PerformanceTypePoint>;

/** Single resume session from recent-resume-sessions */
export interface ResumeSessionRaw {
  id: string;
  score: number;
  sessionId: string;
  resumeName: string;
  company: string;
  foundKeywords: string[];
  notFoundKeywords: string[];
  role: string;
}

/** Recent-resume-sessions API response */
export interface RecentResumeSessionsResponse {
  totalSessions: number;
  sessions: ResumeSessionRaw[];
}

/** Single interview session from recent-interview-sessions */
export interface InterviewSessionRaw {
  id: string;
  overallScore: number;
  savedAt: string;
  interviewTest: {
    id: string;
    title: string;
    difficulty: string;
    duration: number;
    description: string;
    topics: string[];
    company: string | null;
    subject: string | null;
  };
  parentInterviewType: {
    id: string;
    title: string;
    description: string;
    type: string;
    tags: string[];
  };
}

/** Recent-interview-sessions API response */
export interface RecentInterviewSessionsResponse {
  totalSessions: number;
  sessions: InterviewSessionRaw[];
}

/** Legacy raw types (kept for any remaining usage) */
export interface VideoInterviewReportRaw {
  id: number;
  interview_id?: number;
  session_id?: string;
  interview_type?: string;
  company?: string;
  subject?: string;
  title?: string;
  created_at: string;
  duration?: number;
  overall_score?: number;
  rank?: number;
}

/** Normalized video interview report for UI */
export interface VideoInterviewReport {
  id: number | string;
  type: string;
  title: string;
  date: string;
  duration: number;
  score: number | undefined;
  status: string;
  difficulty?: string;
  topics?: string[];
  interviewType?: string;
  company?: string | null;
  subject?: string | null;
  sessionId?: string;
  rank?: number;
}

/** Normalized resume report for UI */
export interface ResumeReport {
  id: number | string;
  fileName: string;
  date: string;
  overallScore: number | undefined;
  jobMatchScore: number | undefined;
  targetRole: string | undefined;
  company: string | undefined;
  keyStrengths: string[] | undefined;
  improvements: string[] | undefined;
}

/** Combined recent activity item (generic) */
export interface RecentActivityItem {
  id: number;
  title: string;
  questions?: number | null;
  difficulty?: string | null;
  score?: number;
  duration?: number | null;
  completedAt: string;
}

export interface ClassroomStats {
  classesJoined: number;
  upcomingSlots: number;
  assignments: number;
}

export interface PerformanceTrendPoint {
  date: string | null;
  score: number;
}

/** UI shape: per-type stats (derived from performance or latest-stats) */
export interface PerformanceTypeStats {
  count: number;
  avg_score: number;
  trend?: PerformanceTrendPoint[];
}

/** UI shape: by type (keys match API: technical, behavioral, role-based, etc.) */
export interface PerformanceByType {
  technical?: PerformanceTypeStats;
  behavioral?: PerformanceTypeStats;
  'role-based'?: PerformanceTypeStats;
  'case-study'?: PerformanceTypeStats;
  debate?: PerformanceTypeStats;
  specialised?: PerformanceTypeStats;
  miscellaneous?: PerformanceTypeStats;
  [key: string]: PerformanceTypeStats | undefined;
}

export interface PerformanceOverall {
  total_sessions: number;
  overall_avg: number;
  final_rank?: number;
  trend: PerformanceTrendPoint[];
}

/** Combined analysis for dashboard (from latest-stats + performance) */
export interface PerformanceAnalysis {
  by_type: PerformanceByType;
  overall: PerformanceOverall;
}
