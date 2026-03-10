import { djangoClient } from '../api/axiosInstance';
import { DASHBOARD_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  VideoInterviewReportRaw,
  ResumeReportRaw,
  VideoInterviewReport,
  ResumeReport,
  RecentActivityItem,
  ClassroomStats,
  PerformanceAnalysis,
} from '../types/dashboard';

// Dashboard data is lightweight; always fetch fresh for simplicity.
export function clearDashboardCache(): void {
  // no-op now that we always fetch fresh data
}

/** Fetch latest video interview stats (always hits API) */
export async function getLatestStats(): Promise<VideoInterviewReportRaw[]> {
  const res = await djangoClient.get(DASHBOARD_ENDPOINTS.LATEST_STATS);
  return Array.isArray(res.data) ? res.data : [];
}

/** Fetch resume progress / reports (always hits API) */
export async function getResumeProgress(): Promise<ResumeReportRaw[]> {
  const res = await djangoClient.get(DASHBOARD_ENDPOINTS.RESUME_PROGRESS);
  return Array.isArray(res.data) ? res.data : [];
}

/** Student performance analysis */
export async function getPerformanceAnalysis(): Promise<PerformanceAnalysis | null> {
  const res = await djangoClient.get(DASHBOARD_ENDPOINTS.PERFORMANCE_ANALYSIS).catch(() => ({ data: null }));
  const data = res?.data;
  if (!data) return null;
  return data as PerformanceAnalysis;
}

/** Classroom stats (classes, time slots, assignments) */
export async function getClassroomStats(): Promise<ClassroomStats> {
  const [classesRes, slotsRes, assignRes] = await Promise.all([
    djangoClient.get(DASHBOARD_ENDPOINTS.CLASSES),
    djangoClient.get(DASHBOARD_ENDPOINTS.TIME_SLOTS),
    djangoClient.get(DASHBOARD_ENDPOINTS.ASSIGNMENTS),
  ]);
  const classes = (classesRes.data as { results?: unknown[] })?.results ?? (Array.isArray(classesRes.data) ? classesRes.data : []);
  const slots = (slotsRes.data as { results?: unknown[] })?.results ?? (Array.isArray(slotsRes.data) ? slotsRes.data : []);
  const assignments = (assignRes.data as { results?: unknown[] })?.results ?? (Array.isArray(assignRes.data) ? assignRes.data : []);
  const enrolledClasses = Array.isArray(classes) ? classes.filter((c: { is_student?: boolean }) => c.is_student) : [];
  const upcomingSlots = Array.isArray(slots) ? slots.filter((s: { status?: string }) => s.status === 'available') : [];
  return {
    classesJoined: enrolledClasses.length,
    upcomingSlots: upcomingSlots.length,
    assignments: assignments.length,
  };
}

/** Map raw video report to UI shape. Caller can pass interviewTypeLookup for title/difficulty/topics. */
export function mapVideoReport(
  item: VideoInterviewReportRaw,
  interviewTypeLookup?: (interviewId: number) => { title?: string; category?: string; difficulty?: string; topics?: string[] } | null
): VideoInterviewReport {
  const interviewId = item.interview_id ?? item.id;
  const meta = interviewTypeLookup?.(interviewId);
  const typeLabel = item.company ?? item.subject ?? item.interview_type ?? meta?.category ?? 'Interview';
  return {
    id: interviewId,
    type: typeLabel,
    title: item.title ?? meta?.title ?? 'Interview',
    date: new Date(item.created_at).toLocaleDateString(),
    duration: item.duration ?? 0,
    score: item.overall_score,
    status: 'completed',
    difficulty: meta?.difficulty,
    topics: meta?.topics,
    interviewType: item.interview_type,
    company: item.company,
    subject: item.subject,
    sessionId: item.session_id,
    rank: item.rank,
  };
}

/** Map raw resume report to UI shape */
export function mapResumeReport(item: ResumeReportRaw): ResumeReport {
  return {
    id: item.id,
    fileName: item.resume_name ?? 'Resume',
    date: new Date(item.created_at).toLocaleDateString(),
    overallScore: item.overall_score,
    jobMatchScore: item.job_match_score,
    targetRole: item.role,
    company: item.company,
    keyStrengths: item.strengths,
    improvements: item.weaknesses,
  };
}

/** Build recent activity list (combined and sorted by date, then slice). */
export function buildRecentActivity(
  videoRaw: VideoInterviewReportRaw[],
  resumeRaw: ResumeReportRaw[],
  interviewTypeLookup: (interviewId: number) => { title?: string; questions?: number; duration?: number; difficulty?: string } | null,
  limit: number
): RecentActivityItem[] {
  const combined: { created_at: string; interview_id?: number; resume_name?: string; overall_score?: number }[] = [
    ...videoRaw,
    ...resumeRaw,
  ];
  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return combined.slice(0, limit).map((item, index) => {
    const hasInterview = 'interview_id' in item && item.interview_id != null;
    const meta = hasInterview ? interviewTypeLookup(item.interview_id!) : null;
    return {
      id: index,
      title: meta?.title ?? (item as ResumeReportRaw).resume_name ?? 'Activity',
      questions: meta?.questions ?? null,
      difficulty: meta?.difficulty ?? null,
      score: item.overall_score,
      duration: meta?.duration ?? null,
      completedAt: new Date(item.created_at).toLocaleDateString(),
    };
  });
}
