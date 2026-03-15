import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getLatestStats,
  getResumeProgress,
  getPerformanceAnalysis,
  getClassroomStats,
  clearDashboardCache,
  mapVideoReport,
  mapResumeReport,
} from '../../services/dashboardService';
import type { VideoInterviewReport, ResumeReport, PerformanceAnalysis } from '../../types/dashboard';
import DashboardHeader from './components/DashboardHeader';
import DashboardQuickLinks from './components/DashboardQuickLinks';
import DashboardSkeleton from './components/DashboardSkeleton';
import VideoReportsCard from './components/VideoReportsCard';
import ResumeReportsCard from './components/ResumeReportsCard';
import PerformanceOverviewCards from './components/PerformanceOverviewCards';
import PerformanceTrendChart from './components/PerformanceTrendChart';
import PerformanceByTypeBreakdown from './components/PerformanceByTypeBreakdown';
import { ROUTES } from '../../constants/routerConstants';
import './Dashboard.css';

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
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
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
        getLatestStats(),
        getResumeProgress(),
        getPerformanceAnalysis().catch(() => null),
        getClassroomStats().catch(() => null),
      ]);
      setVideoReports(videoRaw.map((item) => mapVideoReport(item, getInterviewMeta)));
      setResumeReports(resumeRaw.map(mapResumeReport));
      setPerformanceAnalysis(perf);
      setClassroomStats(classroom ?? null);
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
    const path = ROUTES.FEEDBACK_HISTORY.replace(':interviewId', String(report.id));
    navigate(path, {
      state: {
        type: 'video-interview',
        interview_id: report.id,
        interview_type: report.interviewType,
        title: report.title,
        date: report.date,
        back: ROUTES.STUDENT_DASHBOARD,
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
        back: ROUTES.STUDENT_DASHBOARD,
      },
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__inner">
        <DashboardHeader displayName={user?.displayName ?? user?.email ?? null} />
        <DashboardQuickLinks />

        {performanceAnalysis && (
          <section className="dashboard__section dashboard__section--performance" aria-labelledby="performance-heading">
            <div className="dashboard__section-header">
              <h2 id="performance-heading" className="dashboard__section-title">
                <span className="dashboard__section-title-icon" aria-hidden>
                  <BarChart3 />
                </span>
                Performance overview
              </h2>
              <p className="dashboard__section-subtitle">Your scores across interview types and over time</p>
            </div>
            <PerformanceOverviewCards byType={performanceAnalysis.by_type} overall={performanceAnalysis.overall} />
            <div className="dashboard__grid-cols-2">
              <PerformanceTrendChart trend={performanceAnalysis.overall.trend} title="Overall performance trend" />
              <PerformanceByTypeBreakdown byType={performanceAnalysis.by_type} />
            </div>
          </section>
        )}

        {classroomStats != null && (classroomStats.classesJoined > 0 || classroomStats.upcomingSlots > 0 || classroomStats.assignments > 0) && (
          <section className="dashboard__section" aria-labelledby="classroom-heading">
            <div className="dashboard__classroom">
              <div className="dashboard__classroom-accent" aria-hidden />
              <div className="dashboard__classroom-body">
                <h2 id="classroom-heading" className="dashboard__classroom-title">
                  <span className="dashboard__classroom-title-icon" aria-hidden>
                    <GraduationCap />
                  </span>
                  My Classroom
                </h2>
                <div className="dashboard__classroom-grid">
                  <div className="dashboard__classroom-stat-wrap">
                    <p className="dashboard__classroom-stat">{classroomStats.classesJoined}</p>
                    <p className="dashboard__classroom-label">Classes Joined</p>
                  </div>
                  <div className="dashboard__classroom-stat-wrap">
                    <p className="dashboard__classroom-stat">{classroomStats.upcomingSlots}</p>
                    <p className="dashboard__classroom-label">Upcoming Slots</p>
                  </div>
                  <div className="dashboard__classroom-stat-wrap">
                    <p className="dashboard__classroom-stat">{classroomStats.assignments}</p>
                    <p className="dashboard__classroom-label">Assignments</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="dashboard__section" aria-labelledby="reports-heading">
          <div className="dashboard__section-header">
            <h2 id="reports-heading" className="dashboard__section-title">
              <span className="dashboard__section-title-icon" aria-hidden>
                <FileText />
              </span>
              Past Reports & Analysis
            </h2>
            <p className="dashboard__section-subtitle">Review your interview performance and resume insights</p>
          </div>
          <div className="dashboard__grid-cols-2">
            <VideoReportsCard reports={videoReports} onReportClick={handleVideoReportClick} />
            <ResumeReportsCard reports={resumeReports} onReportClick={handleResumeReportClick} />
          </div>
        </section>
      </div>
    </div>
  );
}
