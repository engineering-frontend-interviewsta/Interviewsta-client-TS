import { nestClient } from '../api/axiosInstance';
import { DASHBOARD_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  LatestStatsResponse,
  PerformanceResponse,
  RecentResumeSessionsResponse,
  RecentInterviewSessionsResponse,
  InterviewSessionRaw,
  ResumeSessionRaw,
  VideoInterviewReport,
  ResumeReport,
  PerformanceAnalysis,
  PerformanceTrendPoint,
  PerformanceByType,
  InterviewTypeKey,
  RecentActivityItem,
} from '../types/dashboard';

export function clearDashboardCache(): void {
  // no-op
}

/** Fetch latest-stats (performance trend: this week vs last week) */
export async function getLatestStats(): Promise<LatestStatsResponse> {
  const res = await nestClient.get<LatestStatsResponse>(DASHBOARD_ENDPOINTS.LATEST_STATS);
  return res.data;
}

/** Fetch recent-resume-sessions */
export async function getResumeSessions(): Promise<RecentResumeSessionsResponse> {
  const res = await nestClient.get<RecentResumeSessionsResponse>(DASHBOARD_ENDPOINTS.RESUME_SESSIONS);
  return res.data;
}

/** Fetch performance (overall per interview type) */
export async function getPerformance(): Promise<PerformanceResponse | null> {
  const res = await nestClient.get<PerformanceResponse>(DASHBOARD_ENDPOINTS.PERFORMANCE).catch(() => ({ data: null }));
  return res?.data ?? null;
}

/**
 * Fetch recent-interview-sessions. Pass a high `limit` for full history (e.g. video interview history page).
 * Dashboard widgets typically use the default (5).
 */
export async function getInterviewSessions(limit = 5): Promise<RecentInterviewSessionsResponse | null> {
  const res = await nestClient
    .get<RecentInterviewSessionsResponse>(DASHBOARD_ENDPOINTS.INTERVIEW_SESSIONS, {
      params: { n: limit },
    })
    .catch(() => ({ data: null }));
  return res?.data ?? null;
}

/** Build trend array from latest-stats diffLastWeek (this week vs last week) */
function buildTrendFromLatestStats(latest: LatestStatsResponse): PerformanceTrendPoint[] {
  const { currentWeek, prevWeek } = latest.diffLastWeek ?? { currentWeek: {}, prevWeek: {} };
  const keys = Object.keys(currentWeek || {}) as InterviewTypeKey[];
  const prevAvg =
    keys.length > 0
      ? keys.reduce((s, k) => s + (prevWeek?.[k]?.score ?? 0), 0) / keys.length
      : 0;
  const currAvg =
    keys.length > 0
      ? keys.reduce((s, k) => s + (currentWeek?.[k]?.score ?? 0), 0) / keys.length
      : 0;
  const prevDate = latest.prevWeekStartDate ?? null;
  const currDate = latest.currentWeekStartDate ?? null;
  return [
    { date: prevDate, score: Math.round(prevAvg) },
    { date: currDate, score: Math.round(currAvg) },
  ];
}

/** Build PerformanceAnalysis from latest-stats + performance responses */
export function buildPerformanceAnalysis(
  latest: LatestStatsResponse | null,
  performance: PerformanceResponse | null
): PerformanceAnalysis | null {
  const by_type: PerformanceByType = {};
  if (performance) {
    (Object.keys(performance) as InterviewTypeKey[]).forEach((key) => {
      const p = performance[key];
      if (p) by_type[key] = { count: p.totalSessions, avg_score: p.averageScore };
    });
  }
  const trend = latest ? buildTrendFromLatestStats(latest) : [];
  return {
    by_type,
    overall: {
      total_sessions: latest?.totalSessions ?? 0,
      overall_avg: latest?.overallAvg ?? 0,
      final_rank: latest?.finalRank,
      trend,
    },
  };
}

/** Map interview session (recent-interview-sessions) to UI VideoInterviewReport */
export function mapVideoReport(
  item: InterviewSessionRaw,
  _interviewTypeLookup?: (interviewId: number) => { title?: string; category?: string; difficulty?: string; topics?: string[] } | null
): VideoInterviewReport {
  const test = item.interviewTest ?? {};
  const parent = item.parentInterviewType ?? {};
  return {
    id: item.id,
    type: parent.type ?? test.company ?? test.subject ?? 'Interview',
    title: test.title ?? 'Interview',
    date: item.savedAt ? new Date(item.savedAt).toLocaleDateString() : '',
    duration: test.duration ?? 0,
    score: item.overallScore,
    sleeveScores: item.sleeveScores,
    communicationOverall: item.communicationOverall,
    grammarOverall: item.grammarOverall,
    status: 'completed',
    difficulty: test.difficulty,
    topics: test.topics,
    interviewType: parent.type,
    company: test.company ?? undefined,
    subject: test.subject ?? undefined,
    sessionId: item.id,
  };
}

/** Map resume session (recent-resume-sessions) to UI ResumeReport */
export function mapResumeReport(item: ResumeSessionRaw): ResumeReport {
  return {
    id: item.id,
    fileName: item.resumeName ?? 'Resume',
    date: '', // API doesn't provide date; could use sessionId or leave empty
    overallScore: item.score,
    jobMatchScore: undefined,
    targetRole: item.role || undefined,
    company: item.company || undefined,
    keyStrengths: item.foundKeywords?.length ? item.foundKeywords : undefined,
    improvements: item.notFoundKeywords?.length ? item.notFoundKeywords : undefined,
  };
}

/** Build recent activity list (combined and sorted). Uses new session shapes. */
export function buildRecentActivity(
  interviewSessions: InterviewSessionRaw[],
  resumeSessions: ResumeSessionRaw[],
  limit: number
): RecentActivityItem[] {
  const withDate = [
    ...interviewSessions.map((s) => ({ at: s.savedAt, title: s.interviewTest?.title ?? 'Interview', score: s.overallScore })),
    ...resumeSessions.map((s) => ({ at: '', title: s.resumeName, score: s.score })),
  ];
  withDate.sort((a, b) => (b.at ? new Date(b.at).getTime() : 0) - (a.at ? new Date(a.at).getTime() : 0));
  return withDate.slice(0, limit).map((item, index) => ({
    id: index,
    title: item.title ?? 'Activity',
    questions: null,
    difficulty: null,
    score: item.score,
    duration: null,
    completedAt: item.at ? new Date(item.at).toLocaleDateString() : '',
  }));
}
