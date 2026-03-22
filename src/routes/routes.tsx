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
const Home = lazy(() => import('../landing/Home'));
const About = lazy(() => import('../landing/AboutUs'));
const Contact = lazy(() => import('../landing/ContactUs'));
const PrivacyPolicy = lazy(() => import('../landing/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../landing/TermsOfService'));
const VideoInterviewsPage = lazy(() => import('../landing/VideoInterviewsPage'));
const ResumeAnalysisPage = lazy(() => import('../landing/ResumeAnalysisPage'));
const LandingDashboard = lazy(() => import('../landing/LandingDashboard'));
const LandingCatchAll = lazy(() => import('../landing/PageNotFound'));

const Login = lazy(() => import('../pages/Auth/Login'));
const Signup = lazy(() => import('../pages/Auth/Signup'));
const OAuthCallback = lazy(() => import('../pages/Auth/OAuthCallback'));
const StudentDashboard = lazyWithRetry(() => import('../pages/Dashboard'));
const VideoInterview = lazyWithRetry(() => import('../pages/VideoInterview'));
const InterviewInterface = lazyWithRetry(() => import('../pages/InterviewInterface'));
const Feedback = lazyWithRetry(() => import('../pages/Feedback'));
const VideoInterviewHistory = lazyWithRetry(() => import('../pages/VideoInterviewHistory'));
const ResumeAnalysisHistory = lazyWithRetry(() => import('../pages/ResumeAnalysisHistory'));
const TeacherClasses = lazyWithRetry(() => import('../pages/Teacher/Classes'));
const TeacherSchedule = lazyWithRetry(() => import('../pages/Teacher/Schedule'));
const TeacherStudents = lazyWithRetry(() => import('../pages/Teacher/Students'));
const StudentClasses = lazyWithRetry(() => import('../pages/Student/Classes'));
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

const routeConfig = [
  {
    path: ROUTES.HOME,
    element: <LandingLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'video-interviews', element: <VideoInterviewsPage /> },
      { path: 'resume', element: <ResumeAnalysisPage /> },
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
    path: '/teacher',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: 'classes', element: <TeacherClasses /> },
      { path: 'schedule', element: <TeacherSchedule /> },
      { path: 'students', element: <TeacherStudents /> },
    ],
  },
  {
    path: '/student',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: 'classes', element: <StudentClasses /> },
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
    path: ROUTES.NOT_FOUND,
    element: <PageNotFound />,
    errorElement: <RouteError />,
  },
];

export const router = createBrowserRouter(routeConfig);
