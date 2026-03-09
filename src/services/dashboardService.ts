import { djangoClient } from '../api/axiosInstance';
import { DASHBOARD_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  VideoInterviewReportRaw,
  ResumeReportRaw,
  VideoInterviewReport,
  ResumeReport,
  RecentActivityItem,
  ClassroomStats,
} from '../types/dashboard';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_KEYS = { LATEST_STATS: 'dashboard_latestStats', RESUME_PROGRESS: 'dashboard_resumeProgress' } as const;

async function getCached<T>(key: string, fetchFn: () => Promise<T>, ttlMs = CACHE_TTL_MS): Promise<T> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { value, timestamp } = JSON.parse(raw) as { value: T; timestamp: number };
      if (Date.now() - timestamp < ttlMs) return value;
    }
  } catch {
    // ignore
  }
  const value = await fetchFn();
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    // ignore
  }
  return value;
}

export function clearDashboardCache(): void {
  localStorage.removeItem(CACHE_KEYS.LATEST_STATS);
  localStorage.removeItem(CACHE_KEYS.RESUME_PROGRESS);
}

/** Fetch latest video interview stats (with optional cache bypass) */
export async function getLatestStats(bypassCache = false): Promise<VideoInterviewReportRaw[]> {
  const fetch = () =>
    djangoClient.get(DASHBOARD_ENDPOINTS.LATEST_STATS).then((res) => (Array.isArray(res.data) ? res.data : []));
  if (bypassCache) return fetch();
  return getCached(CACHE_KEYS.LATEST_STATS, fetch);
}

/** Fetch resume progress / reports */
export async function getResumeProgress(bypassCache = false): Promise<ResumeReportRaw[]> {
  const fetch = () =>
    djangoClient.get(DASHBOARD_ENDPOINTS.RESUME_PROGRESS).then((res) => (Array.isArray(res.data) ? res.data : []));
  if (bypassCache) return fetch();
  return getCached(CACHE_KEYS.RESUME_PROGRESS, fetch);
}

/** Student performance analysis */
export async function getPerformanceAnalysis(): Promise<unknown> {
  const res = await djangoClient.get(DASHBOARD_ENDPOINTS.PERFORMANCE_ANALYSIS).catch(() => ({ data: null }));
  return res?.data ?? null;
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
  const meta = interviewTypeLookup?.(item.interview_id ?? 0);
  const typeLabel = item.company ?? item.subject ?? item.interview_type ?? meta?.category ?? 'Interview';
  return {
    id: item.id,
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
