import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getLatestStats,
  getResumeProgress,
  getPerformanceAnalysis,
  getClassroomStats,
  clearDashboardCache,
  mapVideoReport,
  mapResumeReport,
  buildRecentActivity,
} from '../../services/dashboardService';
import type { VideoInterviewReport, ResumeReport } from '../../types/dashboard';
import DashboardHeader from './components/DashboardHeader';
import DashboardQuickLinks from './components/DashboardQuickLinks';
import DashboardSkeleton from './components/DashboardSkeleton';
import VideoReportsCard from './components/VideoReportsCard';
import ResumeReportsCard from './components/ResumeReportsCard';
import { ROUTES } from '../../constants/routerConstants';

/** Interview type lookup: (interviewId) => meta. Use null until we have interviewTypes data. */
function getInterviewMeta(_interviewId: number): { title?: string; category?: string; difficulty?: string; topics?: string[] } | null {
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videoReports, setVideoReports] = useState<VideoInterviewReport[]>([]);
  const [resumeReports, setResumeReports] = useState<ResumeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<unknown>(null);
  const [classroomStats, setClassroomStats] = useState<{ classesJoined: number; upcomingSlots: number; assignments: number } | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    const shouldRefresh = sessionStorage.getItem('refreshDashboard') === 'true';
    if (shouldRefresh) {
      clearDashboardCache();
      sessionStorage.removeItem('refreshDashboard');
    }
    try {
      const [videoRaw, resumeRaw, perf, classroom] = await Promise.all([
        getLatestStats(shouldRefresh),
        getResumeProgress(shouldRefresh),
        getPerformanceAnalysis().catch(() => null),
        getClassroomStats().catch(() => null),
      ]);
      setVideoReports(videoRaw.map((item) => mapVideoReport(item, getInterviewMeta)));
      setResumeReports(resumeRaw.map(mapResumeReport));
      setPerformanceAnalysis(perf);
      setClassroomStats(classroom ?? null);
      // buildRecentActivity available if we add a RecentActivity section later
      void buildRecentActivity(videoRaw, resumeRaw, (id) => getInterviewMeta(id), 3);
    } catch {
      navigate(ROUTES.HOME);
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    loadData();
  }, [user, loadData]);

  const handleVideoReportClick = (report: VideoInterviewReport) => {
    // TODO: navigate to feedback view when route exists
    navigate(ROUTES.FEEDBACK, {
      state: {
        type: 'video-interview',
        interview_id: report.id,
        interview_type: report.interviewType,
        title: report.title,
        date: report.date,
        back: ROUTES.DASHBOARD,
      },
    });
  };

  const handleResumeReportClick = (report: ResumeReport) => {
    navigate(ROUTES.FEEDBACK, {
      state: {
        type: 'resume-analysis',
        fileName: report.fileName,
        date: report.date,
        resume_id: report.id,
        back: ROUTES.DASHBOARD,
      },
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <DashboardHeader displayName={user?.displayName ?? user?.email ?? null} />
        <DashboardQuickLinks />

        {performanceAnalysis != null && (
          <div className="mb-8">
            {/* Placeholder for PerformanceOverviewCards / PerformanceTrendChart when we add those components */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Performance overview</h2>
              <p className="text-gray-600 text-sm">Detailed charts can be added here.</p>
            </div>
          </div>
        )}

        {classroomStats != null && (classroomStats.classesJoined > 0 || classroomStats.upcomingSlots > 0 || classroomStats.assignments > 0) && (
          <div className="mb-8 rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Classroom</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{classroomStats.classesJoined}</div>
                <div className="text-xs text-gray-600">Classes Joined</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{classroomStats.upcomingSlots}</div>
                <div className="text-xs text-gray-600">Upcoming Slots</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{classroomStats.assignments}</div>
                <div className="text-xs text-gray-600">Assignments</div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Past Reports & Analysis</h2>
          <p className="text-gray-600">Review your interview performance and resume insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VideoReportsCard reports={videoReports} onReportClick={handleVideoReportClick} />
          <ResumeReportsCard reports={resumeReports} onReportClick={handleResumeReportClick} />
        </div>
      </div>
    </div>
  );
}
