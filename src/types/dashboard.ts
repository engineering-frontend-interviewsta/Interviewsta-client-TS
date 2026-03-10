/** Single item from latest-stats (video interview report) */
export interface VideoInterviewReportRaw {
  id: number;
  interview_id?: number;
  /** Optional unique session identifier if backend provides it */
  session_id?: string;
  interview_type?: string;
  company?: string;
  subject?: string;
  title?: string;
  created_at: string;
  duration?: number;
  overall_score?: number;
  /** Optional leaderboard rank or similar */
  rank?: number;
}

/** Single item from get-resume-progress (resume analysis report) */
export interface ResumeReportRaw {
  id: number;
  resume_name?: string;
  created_at: string;
  overall_score?: number;
  job_match_score?: number;
  role?: string;
  company?: string;
  strengths?: string[];
  weaknesses?: string[];
}

/** Normalized video interview report for UI */
export interface VideoInterviewReport {
  /** Identifier we use to refetch feedback – maps to backend interview_id */
  id: number;
  type: string;
  title: string;
  date: string;
  duration: number;
  score: number | undefined;
  status: string;
  difficulty?: string;
  topics?: string[];
  interviewType?: string;
  company?: string;
  subject?: string;
  /** Optional session_id when available */
  sessionId?: string;
  /** Optional rank when provided by backend */
  rank?: number;
}

/** Normalized resume report for UI */
export interface ResumeReport {
  id: number;
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

export interface PerformanceTypeStats {
  count: number;
  avg_score: number;
  trend?: PerformanceTrendPoint[];
}

export interface PerformanceByType {
  technical?: PerformanceTypeStats;
  hr?: PerformanceTypeStats;
  case_study?: PerformanceTypeStats;
  communication?: PerformanceTypeStats;
  debate?: PerformanceTypeStats;
  [key: string]: PerformanceTypeStats | undefined;
}

export interface PerformanceOverall {
  total_sessions: number;
  overall_avg: number;
  trend: PerformanceTrendPoint[];
}

export interface PerformanceAnalysis {
  by_type: PerformanceByType;
  overall: PerformanceOverall;
}
