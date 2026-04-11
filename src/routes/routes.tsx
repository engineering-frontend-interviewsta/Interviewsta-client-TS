import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../constants/routerConstants';
import LandingLayout from '../layout/LandingLayout';
import AuthLayout from '../layout/AuthLayout';
import AppLayout from '../layout/AppLayout';
import PageNotFound from '../components/shared/PageNotFound';
import RouteError from '../components/shared/RouteError';
import lazyWithRetry from '../utils/lazyWithRetry';

/** Legacy marketing pages (ported as-is from interviewsta-landing-website). */
const LandingHome = lazy(() => import('../landing/Home'));
const About = lazy(() => import('../landing/AboutUs'));
const Contact = lazy(() => import('../landing/ContactUs'));
const PrivacyPolicy = lazy(() => import('../landing/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../landing/TermsOfService'));
const VideoInterviewsPage = lazy(() => import('../landing/VideoInterviewsPage'));
const ResumeAnalysisPage = lazy(() => import('../landing/ResumeAnalysisPage'));
const PricingPage = lazy(() => import('../landing/PricingPage.tsx'));
const LandingDashboard = lazy(() => import('../landing/LandingDashboard'));
const LandingCatchAll = lazy(() => import('../landing/PageNotFound'));

const Login = lazy(() => import('../pages/Auth/Login'));
const Signup = lazy(() => import('../pages/Auth/Signup'));
const OAuthCallback = lazy(() => import('../pages/Auth/OAuthCallback'));
const StudentDashboard = lazyWithRetry(() => import('../pages/Dashboard'));
const VideoInterview = lazyWithRetry(() => import('../pages/VideoInterview'));
const InterviewInterface = lazyWithRetry(() => import('../pages/InterviewInterface'));
const TestVideo = lazyWithRetry(() => import('../experimental/pages/TestVideo'));
const TestFeedback = lazyWithRetry(() => import('../experimental/pages/TestFeedback'));
const Feedback = lazyWithRetry(() => import('../pages/Feedback'));
const VideoInterviewHistory = lazyWithRetry(() => import('../pages/VideoInterviewHistory'));
const ResumeAnalysisHistory = lazyWithRetry(() => import('../pages/ResumeAnalysisHistory'));
const StudentInterviewHistory = lazyWithRetry(() => import('../pages/Student/InterviewHistory'));
const AdminDashboard = lazyWithRetry(() => import('../pages/Admin/Dashboard'));
const AdminUsers = lazyWithRetry(() => import('../pages/Admin/Users'));
const AdminInterviewThumbnails = lazyWithRetry(() => import('../pages/Admin/InterviewThumbnails'));
const Account = lazyWithRetry(() => import('../pages/Account'));
const Learning = lazyWithRetry(() => import('../pages/Learning'));
const LearningArrays = lazyWithRetry(() => import('../pages/Learning/Arrays'));
const ResumeAnalysisFlow = lazyWithRetry(() => import('../pages/ResumeAnalysisFlow'));
const ResumeGeneration = lazyWithRetry(() => import('../pages/ResumeGeneration'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const OrgSetupPage = lazyWithRetry(() => import('../pages/Org/Setup'));
const OrgDashboardPage = lazyWithRetry(() => import('../pages/Org/Dashboard'));
const OrgTeacherDetailPage = lazyWithRetry(() => import('../pages/Org/TeacherDetail'));
const OrgClassDetailPage = lazyWithRetry(() => import('../pages/Org/ClassDetail'));
const OrgStudentDetailPage = lazyWithRetry(() => import('../pages/Org/StudentDetail'));
const TeacherOnboardingPage = lazyWithRetry(() => import('../pages/Teacher/Onboarding'));
const TeacherClassesPage = lazyWithRetry(() => import('../pages/Teacher/Classes'));
const TeacherClassDetailPage = lazyWithRetry(() => import('../pages/Teacher/ClassDetail'));
const TeacherStudentDetailPage = lazyWithRetry(() => import('../pages/Teacher/StudentDetail'));
const StudentMyClassesPage = lazyWithRetry(() => import('../pages/Student/MyClasses'));

const routeConfig = [
  {
    path: ROUTES.HOME,
    element: <LandingLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <LandingHome /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'video-interviews', element: <VideoInterviewsPage /> },
      { path: 'resume', element: <ResumeAnalysisPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'dashboard', element: <LandingDashboard /> },
      { path: '*', element: <LandingCatchAll /> },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: ROUTES.SIGNUP,
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <Signup /> }],
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <ForgotPassword /> }],
  },
  {
    path: ROUTES.AUTH_CALLBACK,
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <OAuthCallback /> }],
  },
  {
    path: ROUTES.STUDENT_DASHBOARD,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <StudentDashboard /> }],
  },
  {
    path: ROUTES.VIDEO_INTERVIEW,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <VideoInterview /> }],
  },
  {
    path: ROUTES.VIDEO_INTERVIEW_REPORTS,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <VideoInterviewHistory /> }],
  },
  {
    path: ROUTES.INTERVIEW_INTERFACE,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <InterviewInterface /> }],
  },
  {
    path: ROUTES.TEST_VIDEO,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TestVideo /> }],
  },
  {
    path: ROUTES.EXPERIMENTAL_TEST_VIDEO,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TestVideo /> }],
  },
  {
    path: ROUTES.EXPERIMENTAL_TEST_FEEDBACK,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TestFeedback /> }],
  },
  {
    path: ROUTES.FEEDBACK,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <Feedback /> }],
  },
  {
    path: ROUTES.FEEDBACK_HISTORY,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <Feedback /> }],
  },
  {
    path: '/student',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: 'interview-history', element: <StudentInterviewHistory /> },
    ],
  },
  {
    path: '/admin',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'interview-thumbnails', element: <AdminInterviewThumbnails /> },
    ],
  },
  {
    path: ROUTES.ACCOUNT,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <Account /> }],
  },
  {
    path: ROUTES.LEARNING,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Learning /> },
      { path: 'arrays', element: <LearningArrays /> },
    ],
  },
  {
    path: ROUTES.RESUME_ANALYSIS,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <ResumeAnalysisFlow /> }],
  },
  {
    path: ROUTES.RESUME_ANALYSIS_REPORTS,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <ResumeAnalysisHistory /> }],
  },
  {
    path: ROUTES.RESUME_GENERATION,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <ResumeGeneration /> }],
  },
  {
    path: ROUTES.ORG_DASHBOARD,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <OrgDashboardPage /> }],
  },
  {
    path: ROUTES.ORG_TEACHER_DETAIL,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <OrgTeacherDetailPage /> }],
  },
  {
    path: ROUTES.ORG_CLASS_DETAIL,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <OrgClassDetailPage /> }],
  },
  {
    path: ROUTES.ORG_STUDENT_DETAIL,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <OrgStudentDetailPage /> }],
  },
  {
    path: ROUTES.ORG_SETUP,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <OrgSetupPage /> }],
  },
  {
    path: ROUTES.TEACHER_ONBOARDING,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TeacherOnboardingPage /> }],
  },
  {
    path: ROUTES.TEACHER_CLASSES,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TeacherClassesPage /> }],
  },
  {
    path: ROUTES.TEACHER_CLASS_DETAIL,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TeacherClassDetailPage /> }],
  },
  {
    path: ROUTES.TEACHER_STUDENT_DETAIL,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <TeacherStudentDetailPage /> }],
  },
  {
    path: ROUTES.STUDENT_MY_CLASSES,
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <StudentMyClassesPage /> }],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <PageNotFound />,
    errorElement: <RouteError />,
  },
];

export const router = createBrowserRouter(routeConfig);
