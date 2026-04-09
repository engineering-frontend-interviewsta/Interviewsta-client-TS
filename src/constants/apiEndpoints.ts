/** Django backend (auth, user, etc.) */
export const AUTH_ENDPOINTS = {
  LOGIN: 'auth/login/',
  REGISTER: 'auth/register/',
  LOGOUT: 'auth/logout/',
  REFRESH: 'auth/refresh/',
  ME: 'auth/me/',
  FORGOT_PASSWORD: 'auth/forgot-password/',
  GOOGLE: 'auth/google/',
  GITHUB: 'auth/github/',
  PATCH_ME: 'auth/me/',
} as const;

/** FastAPI interview service */
export const INTERVIEW_ENDPOINTS = {
  INTERVIEW_TESTS: (page: string, limit: string) => `/interview-test/?page=${page}&limit=${limit}`,
  PARENT_INTERVIEW_TYPES: '/interview-test/parent-types/',
  BY_PARENT_TYPE: (parentTypeId: string, page: string, limit: string) => `/interview-test/by-parent-type/${parentTypeId}/?page=${page}&limit=${limit}`,

  GET_TOKEN: (interviewTestId: string) => `/internal/interview-questions/access-token/?interview_test_id=${interviewTestId}`,
  START: '/interview/start',
  START_STATUS: (taskId: string) => `/interview/start-status/${taskId}`,
  RESPOND_STATUS: (sessionId: string, taskId: string) =>
    `/interview/${sessionId}/respond-status/${taskId}`,
  RESPOND: (sessionId: string) => `/interview/${sessionId}/respond`,
  STATUS: (sessionId: string) => `/interview/${sessionId}/status`,
  STREAM: (sessionId: string) => `/interview/${sessionId}/stream`,
  VIDEO_TELEMETRY: (sessionId: string) => `/interview/${sessionId}/video-telemetry`,
  VIDEO_QUALITY: (sessionId: string) => `/interview/${sessionId}/video-quality`,
  END: '/interview/end',
  FEEDBACK_STATUS: (taskId: string) => `/interview/feedback-status/${taskId}`,
} as const;

/** Resume analysis (NestJS) */
export const RESUME_ENDPOINTS = {
  ANALYZE: 'resume/analyze',
  /** GET saved report by persisted analysis id (UUID) */
  REPORT: (analysisId: string) => `resume/reports/${analysisId}`,
  GET_ANALYSIS: 'get-resume-analysis/',
} as const;

export const COACHING_ENDPOINTS = {
  SESSIONS: 'coaching-sessions/',
} as const;

/** Dashboard & student (Django) */
export const DASHBOARD_ENDPOINTS = {
  PERFORMANCE: '/analytics/performance/',
  LATEST_STATS: '/analytics/latest-stats',
  RESUME_SESSIONS: '/analytics/recent-resume-sessions/',
  INTERVIEW_SESSIONS: '/analytics/recent-interview-sessions/',
  // CLASSES: 'classes/',
  // TIME_SLOTS: 'time-slots/',
  // ASSIGNMENTS: 'assignments/',
} as const;

/** Credit management (NestJS) */
export const CREDIT_ENDPOINTS = {
  DEDUCT_FOR_INTERVIEW: '/credit-management/deduct-for-interview',
} as const;

/** Feedback (Django) */
export const FEEDBACK_ENDPOINTS = {
  // Fetch interview feedback either by sessionId (just-finished interview)
  // or by feedbackId (existing feedback/report id)
  SESSION_HISTORY: '/interview-feedback/',
} as const;

/** Payment (Razorpay) */
export const PAYMENT_ENDPOINTS = {
  CONFIG: '/payment/config',
  PLANS: '/payment/plans',
  CREATE_ORDER: '/payment/create-order',
  VERIFY: '/payment/verify',
  WEBHOOK: '/payment/webhook',
} as const;

/** Billing & account (customer-management) */
export const BILLING_ENDPOINTS = {
  /** GET subscription + legacy user/account (camelCase) */
  ACCOUNT: '/customer-management/subscription/me',
  PLAN_STATUS: '/customer-management/subscription/plan-status',
  /** GET feedback access for current user */
  FEEDBACK_ACCESS: '/customer-management/subscription/feedback-access',
  /** GET paginated transactions */
  TRANSACTIONS: (page: number) => `/customer-management/transactions?page=${page}`,
  CREATE_ORDER: 'billing/create-order/',
  VERIFY_PAYMENT: 'billing/verify-payment/',
  ADMIN_USERS: (page: number) => `billing/admin/users/?page=${page}`,
  ADMIN_DASHBOARD: 'billing/admin/dashboard/',
  ADMIN_USER_TIER: (userId: number) => `billing/admin/users/${userId}/tier/`,
  ADMIN_USER_DELETE: (userId: number) => `billing/admin/users/${userId}/delete/`,
} as const;

/** Session management (NestJS /auth/sessions) */
export const SESSION_ENDPOINTS = {
  LIST: '/auth/sessions',
  REVOKE: (id: string) => `/auth/sessions/${id}`,
  REVOKE_OTHERS: '/auth/sessions',
} as const;

/** Admin user management (NestJS /user/admin/*) */
export const USER_ADMIN_ENDPOINTS = {
  USERS: (page: number, limit = 20) => `/user/admin/users?page=${page}&limit=${limit}`,
  UPDATE_ROLE: (userId: string) => `/user/admin/users/${userId}/role`,
  DELETE_USER: (userId: string) => `/user/admin/users/${userId}`,
  STATS: '/user/admin/stats',
} as const;

/** Teacher (Django) */
export const TEACHER_ENDPOINTS = {
  DASHBOARD_STATS: 'teacher/dashboard-stats/',
  CLASS_PERFORMANCE: (classId: string) => `teacher/class/${classId}/performance/`,
  STUDENTS_BATCH: 'teacher/students-batch/',
} as const;

/** Student (Django) */
export const STUDENT_ENDPOINTS = {
  CLASSES: 'classes/student/',
  JOIN_CLASS: 'student-classes/join/',
  PERFORMANCE_ANALYSIS: 'student/performance-analysis/',
} as const;

/** Classes, assignments, time-slots (Django) */
export const CLASS_ENDPOINTS = {
  LIST: 'classes/',
  DETAIL: (id: string) => `classes/${id}/`,
  ASSIGNMENTS_BY_CLASS: (classId: string) => `assignments/?class_assigned=${classId}`,
  ASSIGNMENT_DETAIL: (id: string) => `assignments/${id}/`,
  SUBMISSIONS: 'assignment-submissions/',
  SUBMISSIONS_BY_ASSIGNMENT: (assignmentId: string) => `assignment-submissions/?assignment=${assignmentId}`,
  TIME_SLOTS: (classId: string) => `time-slots/?class_obj=${classId}`,
  TIME_SLOTS_CREATE: 'time-slots/',
  ANNOUNCEMENTS: (classId: string) => `announcements/?class_obj=${classId}`,
  ANNOUNCEMENTS_CREATE: 'announcements/',
} as const;

/** Resume (legacy Django — kept for history pages only) */
export const RESUME_APP_ENDPOINTS = {
  UPLOAD_FILES: 'upload-files/',
} as const;

/** Admin – interview test thumbnails */
export const ADMIN_INTERVIEW_THUMBNAILS_ENDPOINTS = {
  UPLOAD_THUMBNAIL: (interviewTestId: string) =>
    `/admin/interview-thumbnails/${interviewTestId}/thumbnail`,
} as const;
