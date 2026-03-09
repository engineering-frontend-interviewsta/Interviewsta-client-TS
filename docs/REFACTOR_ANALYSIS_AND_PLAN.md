# Interviewsta Frontend Refactor — Analysis & Phased Plan

This document summarizes the analysis of **interviewsta-landing-website** and a **step-by-step phased refactor** into **Interviewsta-client-TS**, following the clean practices from **f-dummy**.

**Current progress:** Phase 0–6 ✅ done. Full migration pass ✅. **Interview types parity ✅:** All companies, DSA subjects, roles, and interview types from legacy Data/interviewTypes.json + role-based list are in data/interviewTypes.json + data/interviewTypesData.ts. VideoInterview shows full list with category filter and search, and sends correct interviewType + payload (interview_type_id, company, subject, role) to start interview. Build passing. Next: Phase 7 polish or further feature parity.

**What’s ported vs not (keep context):**
- **VideoInterview.jsx (old, ~2186 lines):** **Interview options parity done.** New app has full list: interview-type (Technical, HR, Case Study, Communication, Debate), company-wise (Netflix, Amazon, Google, Apple, Atlassian, Razorpay, CRED, Meesho, HCLTech, Tech Mahindra, LTI Mindtree, Schneider, Meta, Nvidia, Adobe, Snowflake, Stripe, Airbnb), subject-wise (Graphs, Arrays, Strings, DP, Trees, Linked Lists, Stacks & Queues, Heaps), case-study-wise, role-wise (Frontend, Backend, UI/UX, AI/ML, Data Science). Category filter, search, and correct backend payload on Start. Not yet ported: tips drawer, system check modal, setup modal, time-slot URL params.
- **FeedbackTemplates (old):** Not fully ported. New app has `pages/Feedback`: fetches `getSessionHistory`, shows overall score + summary (strengths, areas to improve). Old app has FeedbackRouter + type-specific templates (TechnicalFeedbackTemplate, HRFeedbackTemplate, DebateFeedbackTemplate, CommunicationFeedbackTemplate, CaseStudyFeedbackTemplate) and shared pieces (ScoreBreakdown, TranscriptViewer, ResponseAnalysis, DetailedScoreBars, MetricCards, LockedSection, etc.). Those templates can be ported into `pages/Feedback` + `Feedback/components/` when needed.

**Migration verification (interview types):** Old app uses `Data/interviewTypes.json` and inline `tests` + `roleBasedInterviews` in VideoInterview.jsx. New app: (1) `src/data/interviewTypes.json` is a copy of legacy Data/interviewTypes.json (interview-type, company-wise, subject-wise, case-study-wise with correct ids). (2) Role-based list (Frontend, Backend, UI/UX, AI/ML, Data Science) added in `interviewTypesData.ts`. (3) VideoInterview uses `getBackendInterviewType()` and `getBackendPayload()` so start API receives correct `interviewType` (Technical, HR, Company, Subject, CaseStudy, Communication, Debate, Role-Based Interview) and `payload` (interview_type_id, company, subject, role). All companies, DSA subjects, and roles from the legacy source are available; nothing left behind for the start-interview flow.

**Completed landing pages (Phase 2):** All use `LandingLayout` and live under `pages/` with their own `components/` folders where needed.
- **Home** – `/` (index)
- **Login** – `/login` (Auth/Login)
- **Signup** – `/signup` (Auth/Signup)
- **About** – `/about`
- **Contact** – `/contact` (form + contact info + FAQs)
- **Privacy Policy** – `/privacy-policy`
- **Terms of Service** – `/terms-of-service`
- **Video Interviews** (landing) – `/video-interviews`
- **Resume Analysis** (landing) – `/resume`
- **Landing Dashboard** (public) – `/dashboard`
- **PageNotFound** – `*` (shared component)

---

## What's next (in order of impact)

1. **Phase 5 – Teacher / Student / Admin / Account (full pages)**  
   Add `teacherService`, `studentService`, `adminService`, `accountService` (Django endpoints + types). Replace placeholders with real pages: Teacher Classes list/detail, Student Classes + Interview History, Admin Dashboard + Users, Account (tabs: Billing, Usage, Settings). Use AuthContext `role` for visibility.

2. **Phase 6 – Learning + Resume (full flows)**  
   - **Learning:** Learning service/API if any; Arrays hub (concepts, practice, video solution).  
   - **Resume (app):** Upload → analyze API → result on `ResumeAnalysisFlow`; optional Resume Generation.  
   - **Forgot password:** Form (email) + Django forgot-password endpoint and success/error UI.

3. **Enrich existing flows**  
   - **VideoInterview:** More types, optional system check / tips drawer.  
   - **Feedback:** Port one type-specific template + shared bits (ScoreBreakdown, TranscriptViewer) into `pages/Feedback/components/`.  
   - **InterviewInterface:** Audio/video/code editor or communication phases incrementally.

4. **Phase 7 – Polish & cutover**  
   Global CSS variables, consistent loading/error, env docs, then point production to Interviewsta-client-TS and archive the old app.

---

## Why we're refactoring (don't lose context)

The **existing interviewsta frontend (interviewsta-landing-website) works**, but it is **messy, buggy, and unmaintainable**:

- **State management** is poor: one giant context, auth split across context + in-memory token + localStorage, role read from localStorage in random places. Hard to reason about and source of bugs.
- **API calls** are scattered: components call `fetch`/`axios` with inline URLs and env vars; no single service layer or endpoint constants; duplicate base URLs in many files. Bug-prone and hard to change.
- **Nothing is clean or optimized**: no TypeScript, no config layer, no constants, duplicate components, huge files (e.g. 3.7k-line InterviewInterface), inconsistent loading/error handling, no proper layouts or router config.

We are **not** copying that code as-is. We are **replacing it with the right approach** in **Interviewsta-client-TS**:

- **Single source of truth**: config for env, constants for routes/endpoints/app values, one auth context, one storage module.
- **Clean layers**: services for all API calls (using endpoints + axios instance), utils/helpers for shared logic, pages + their components, shared components in one place.
- **Type safety**: TypeScript and interfaces everywhere so we catch bugs at build time.
- **Predictable state**: AuthContext for auth only; no raw localStorage in components; token/role synced through one place.
- **Maintainable structure**: page-based folders, router config and route constants, layouts, ErrorBoundary and consistent loading/error UI.

Every phase must **preserve behaviour** for the user but **replace the messy implementation** with this clean, optimized approach. When in doubt: fix the pattern (state, API, constants, types) rather than mirror the old buggy style.

---

## Part 1: Current Frontend Analysis (interviewsta-landing-website)

### 1.1 Structure & Organization Issues

| Issue | Details |
|-------|--------|
| **No page-based structure** | All UI lives under one flat `Components/` folder. No clear separation of pages vs page-specific components (e.g. no `pages/Dashboard/` with `pages/Dashboard/components/`). |
| **Router in App.jsx** | All 50+ routes defined inline in `App.jsx`; no `routes/` folder, no `routerConstants`; paths are string literals scattered in code. |
| **Duplicate components** | **Exact duplicates** exist: `AboutUs.jsx` (root) vs `Landing/AboutUs.jsx`; `ContactUs`, `Footer`, `PageNotFound`, `PrivacyPolicy`, `TermsOfService` each exist in both `Components/` and `Components/Landing/`. Same content, two files. |
| **Duplicate feature folders** | `Announcement/ClassAnnouncements.jsx` and `Announcements/ClassAnnouncements.jsx` — two folders for same feature. |
| **Layout mixed with routing** | `RootLayout` and `AppLayout` are defined in `App.jsx`; no dedicated `layout/` folder or reusable layout components. |
| **No constants layer** | No `constants/` folder. API URLs, route paths, storage keys, timeouts, etc. are inline or repeated. |
| **No config layer** | No central `config/`; env vars read ad hoc via `import.meta.env` in many files (see 1.3). |

### 1.2 API & Services Issues

| Issue | Details |
|-------|--------|
| **Two API clients + inconsistent naming** | `api/client.js` exports `fastApiClient` and `djangoClient` with **different env var names**: `VITE_BACKEND_URL` vs `VITE_FASTAPI_BASE_URL` in client; `service/api.js` uses `VITE_BACKEND_URL` and `VITE_FASTAPI_URL` (no `_BASE_`). Risk of wrong base URL. |
| **API calls outside service layer** | Many components call `fetch()`, `axios.post()`, or `api.get()` directly with inline URLs: e.g. `Coaching.jsx` uses `fetch(import.meta.env.VITE_BACKEND_URL + "coaching-sessions/")`; `ResumeAnalysis.jsx` uses `import.meta.env.VITE_BACKEND_URL + "get-resume-analysis/"` and `VITE_FASTAPI_BASE_URL` in two places; `ForgotYourPassword.jsx` uses `axios.post(import.meta.env.VITE_BACKEND_URL + 'forgot-password/')`. No single place for endpoints. |
| **Repeated base URL logic** | At least 8+ files define `apiBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/'` (or similar) locally. |
| **No API constants** | Endpoints like `auth/login/`, `auth/refresh/`, `coaching-sessions/`, `get-resume-analysis/` are raw strings; no `apiEndpoints.js` or equivalent. |
| **Token storage split** | Access token in memory (`service/api.js`: `setAccessToken`, `getAccessToken`, `clearAccessToken`); role in `localStorage`; auth state in context. No single `storage`/auth persistence module. |

### 1.3 Environment & Config Issues

| Issue | Details |
|-------|--------|
| **No config module** | No `config/index.js` or env-specific files (dev/staging/prod). |
| **Env vars used in many places** | `import.meta.env` appears in: `api/client.js`, `service/api.js`, `Signup.jsx`, `LoginPage.jsx`, `Landing/Home.jsx`, `ForgotYourPassword.jsx`, `ResumeAnalysis.jsx`, `Coaching.jsx`, `Teacher/TeacherTimeSlots.jsx`, `Teacher/TeacherStudentBatch.jsx`, `Student/StudentInterviewHistory.jsx`, `Student/StudentTimeSlots.jsx`, `ResumeAnalysisHistory.jsx`, `Announcement/ClassAnnouncements.jsx`. Hard to change env strategy and easy to typo. |
| **Inconsistent env names** | `VITE_FASTAPI_URL` (service/api) vs `VITE_FASTAPI_BASE_URL` (api/client). |
| **No .env.example** | No documented list of required env vars for 3 environments. |

### 1.4 State Management Issues

| Issue | Details |
|-------|--------|
| **Single giant context** | All global state in `VideoInterviewContext`: auth, session, redix session, interview type, video interview state. One `rootReducer` combining 5 reducers. Hard to maintain and reason about. |
| **Auth split across places** | Auth state in context; token in `service/api` (memory); role in `localStorage`; `RequireAuth` and `RoleBasedRoute` read from context + localStorage. No single auth module. |
| **Role from localStorage** | `RoleBasedRoute` uses `localStorage.getItem('role')`; can get out of sync with context. |
| **No dedicated AuthContext** | Auth is a slice of VideoInterviewContext; no clear `AuthContext` + `useAuth()` pattern. |
| **Console logs in production path** | `RequireAuth` has `console.log` for user/loading/requiredState; should be removed or gated. |

### 1.5 Code Duplication

| Area | Duplication |
|------|-------------|
| **Loading UI** | Same pattern repeated: `<div className="min-h-screen flex items-center justify-center"><div className="animate-spin ..."/></div>` in RequireAuth (2x), App.jsx (Suspense fallback), FeedbackTemp, InterviewLoadingPopup, etc. No single `LoadingFallback` component. |
| **Spinner / loading text** | Many components implement their own "Loading..." or spinner (60+ files mention loading/spinner). |
| **Duplicate pages** | AboutUs, ContactUs, Footer, PageNotFound, PrivacyPolicy, TermsOfService each have two files (root + Landing). |
| **API base URL** | Repeated in 8+ files. |
| **Auth check / redirect** | RequireAuth and RoleBasedRoute both do loading + redirect; logic could be unified in a guard + layout. |

### 1.6 File Size & Maintainability

| File | Lines | Issue |
|------|-------|--------|
| **InterviewInterface.jsx** | **~3,755** | Single component with 80+ useState/useEffect; mixed concerns: session, UI, audio, code editor, communication phases, free-tier timer, modals. Should be split into pages + subcomponents + hooks. |
| **VideoInterview.jsx** | **~2,185** | Very large; similar need to split. |
| **Dashboard.jsx** | **~792** | Large; could be page + feature components. |
| **FeedbackTemplate.jsx** | **~2,100+** (from grep) | Large; should be page + templates. |

### 1.7 Router & Layout Issues

| Issue | Details |
|-------|--------|
| **All routes in one array** | 50+ routes in `App.jsx`; no lazy loading except `FeedbackRouter`; no `errorElement`; no route constants. |
| **Inline path strings** | Paths like `"/teacher/class/:id/create-slot"` repeated in router and possibly in `navigate()`/`Link` elsewhere. |
| **No lazy loading for heavy screens** | InterviewInterface, VideoInterview, Dashboard, etc. are eagerly loaded; increases initial bundle. |
| **Layout logic in App** | `hideNavbarroutes`, `isArraysLearningPage`, `shouldshownavbar` are inline; no layout config. |
| **Duplicate route** | `popup-template` appears twice (lines 169 and 176). |

### 1.8 Loading & Error Handling

| Issue | Details |
|-------|--------|
| **No global ErrorBoundary** | No error boundary around the app; runtime errors can white-screen. |
| **No route-level error UI** | No `errorElement` on routes; failed lazy loads or render errors have no fallback. |
| **Inconsistent loading states** | Some components use inline spinner, some use `LoadingEffect`/`LoadingCard`; no standard loading pattern. |
| **No chunk-load error handling** | No handling for "Failed to fetch dynamically imported module" (e.g. after deploy); users can get stuck. |

### 1.9 Type Safety & Consistency

| Issue | Details |
|-------|--------|
| **No TypeScript** | Entire app is JS/JSX; no interfaces for API responses, props, or state. |
| **PropTypes not used** | No PropTypes or type checks on components. |
| **Inconsistent response handling** | Some places use `response.data`, others expect a normalized shape; no shared `normalizeResponse` or types. |

### 1.10 Performance & Bundle

| Issue | Details |
|-------|--------|
| **Eager imports** | Most route components are statically imported in App.jsx; only FeedbackRouter is lazy. Large initial bundle. |
| **No route-based code splitting** | Heavy screens (Interview, Dashboard, VideoInterview) not lazy-loaded. |
| **Possible re-render scope** | Single context with many slices can cause broad re-renders; not measured but a risk. |

### 1.11 Responsiveness & UI

| Issue | Details |
|-------|--------|
| **Inline styles and mixed Tailwind** | Mix of Tailwind and inline styles; no design tokens/CSS variables file like f-dummy's global.css. |
| **Responsive logic scattered** | No single `responsive.css` or breakpoint constants; responsive classes ad hoc. |

### 1.12 Other

| Issue | Details |
|-------|--------|
| **Experimental components in main tree** | Many components under `Experimental/` (CameraCheck, DraggableCodeEditor, LoadingCard, etc.) are imported in App; should be behind feature flags or moved. |
| **ScrollToTop in two layouts** | Used in both RootLayout and AppLayout; fine but could be single wrapper. |
| **No utils/helpers layer** | Some utils in `utils/` (auth.js, planUtils.js, AudioMetricsExtractor, etc.) but no domain helpers like `helpers/auth/formValidation.js`. |

---

## Part 2: Phased Refactor Plan (Interviewsta-client-TS)

Refactor is done **in phases** so each step is shippable and low-risk. Each phase produces a working app (or a clear rollback point).

---

### Refactoring principles (apply every phase)

When refactoring from the old codebase, follow this for **every** migrated piece:

**1. Retain functionality correctly**
- **Map existing behaviour first:** Before rewriting, list what the old code does (API calls, request/response shape, validation rules, redirects, error messages, loading states).
- **Preserve contracts:** Same endpoints, same success/error handling, same redirects by role (e.g. teacher → `/teacher/classes`, student → `/manage`).
- **No silent regressions:** After migration, the refactored flow should be **behaviourally equivalent** (same user-visible outcomes). Test login, signup, validation, redirects, and error paths.

**2. Improve on what’s already done**
- **Cleaner code:** TypeScript types/interfaces, constants instead of magic strings, logic in services/utils/helpers instead of inside components, smaller components, single responsibility.
- **Optimised where it makes sense:** Fewer re-renders (e.g. stable callbacks, splitting context), lazy loading for heavy routes, normalized API response handling, consistent loading/error UI.
- **Best we can do:** Use the patterns from the plan (config, constants, services, layouts, shared LoadingFallback/ErrorBoundary); fix known issues from Part 1 (no inline env, no duplicate components, no giant files).

**Per-phase checklist (before marking a phase “done”):**
- [ ] All existing behaviour for that phase is preserved (flows, APIs, validation, redirects).
- [ ] Code is cleaner (types, constants, services, smaller units).
- [ ] Improvements applied where obvious (performance, UX, maintainability).

---

### Phase 0: Foundation (No migration yet — prepare the new repo)

**Goal:** Set up config, constants, API client, and shared utilities in **Interviewsta-client-TS** so that when we migrate features, they land on a clean base.

**Steps:**

1. **Config**
   - Add `src/config/config.dev.ts`, `config.prod.ts`, `config.staging.ts` (or two if you only need dev/prod).
   - Add `src/config/index.ts`: read `import.meta.env.MODE` and `VITE_*` vars; export single `Config` (e.g. `API_URL`, `FASTAPI_BASE_URL`).
   - Add `.env.example` listing all vars for dev/staging/prod.

2. **Constants**
   - `src/constants/apiEndpoints.ts`: group endpoints by domain (auth, interview, resume, coaching, teacher, student, etc.). Use functions for dynamic segments (e.g. `getPetitionById(id)`).
   - `src/constants/routerConstants.ts`: single `ROUTES` object for every path (e.g. `HOME: '/'`, `LOGIN: '/login'`, `INTERVIEW_INTERFACE: '/interview-interface'`).
   - `src/constants/appConstants.ts`: storage keys, timeouts, pagination, validation limits, etc.

3. **API layer**
   - Single `src/api/axiosInstance.ts` (or `client.ts`): create axios instance with `baseURL: Config.API_URL` (and optional second for FastAPI if needed). Request interceptor: attach Bearer token (from a small auth/storage module). Response interceptor: 401 → refresh token → retry or redirect to login.
   - Move token handling to a small `utils/storage.ts` or `utils/authStorage.ts` (get/set/clear token; use `STORAGE_KEYS` or in-memory for access token as today).
   - Do **not** duplicate Django vs FastAPI logic unnecessarily; prefer one client for Django and one for FastAPI, both using Config.

4. **Utils**
   - `src/utils/serviceUtils.ts`: `SERVICE_HEADERS`, `normalizeResponse`, safe parsers (`safeParseInt`, `safeString`, etc.).
   - `src/utils/storage.ts`: centralize storage keys and get/set/clear for token and any other persisted auth.
   - Optional: `lazyWithRetry.ts` for lazy routes (like f-dummy).

5. **Shared components**
   - `src/components/shared/LoadingFallback.tsx`: single full-page loading spinner (reuse one implementation everywhere).
   - `src/components/shared/PageNotFound.tsx`: 404 page.
   - Optional: `ErrorBoundary.tsx`, `RouteError.tsx` (for route errors and chunk failures).

**Deliverables:** Config, constants, one axios client, utils, LoadingFallback, PageNotFound. No routes yet (or one placeholder route). **No migration of existing pages yet.**

---

### Phase 1: Auth & App Shell

**Goal:** Auth in one place, protected shell, and minimal router in TS.

**Steps:**

1. **Auth context**
   - Add `src/context/AuthContext.tsx`: state (user, role, isLoading), actions (login, logout, register, refresh, me). Use your existing auth API (from service layer).
   - Auth service: `src/services/authService.ts` — all auth calls use `apiEndpoints` + axios instance; no direct `import.meta.env` in components.

2. **Storage & token**
   - Ensure token and optional role persistence are behind `storage.ts` and `AuthContext`; no raw `localStorage.getItem('role')` in components. Context is source of truth; storage is persistence.

3. **Router config**
   - Add `src/routes/routes.tsx`: `createBrowserRouter` with route list. Use `ROUTES` from `routerConstants` for every path.
   - Lazy load heavy screens: `lazyWithRetry(() => import('../pages/...'))`.
   - Add `errorElement: <RouteError />` (or equivalent) to each route.

4. **Layouts**
   - `src/layout/LandingLayout.tsx`: header + outlet + footer (for public landing routes).
   - `src/layout/AppLayout.tsx`: optional navbar + outlet (for authenticated app); inside layout, check auth and redirect to login if not authenticated (like f-dummy’s Layout).
   - `src/routes/RouteGuard.tsx`: for routes that need auth check before render (e.g. home); uses a small `useAuthCheck` hook and shows `LoadingFallback` while checking.

5. **App entry**
   - `App.tsx`: wrap app with `ErrorBoundary` → `AuthProvider` → `RouterProvider router={router}`; single `Suspense` with `LoadingFallback`; global toast if you use it.
   - Remove route definitions from App; they live only in `routes/routes.tsx`.

6. **Migrate only auth-related screens**
   - Implement **Login** and **Signup** (and optionally **ForgotPassword**, **OAuth callback**) as **pages** in `src/pages/Auth/`. Each can have a `components/` subfolder for that page’s UI.
   - These pages use `AuthContext` (login/logout/register); no VideoInterviewContext.

**Deliverables:** AuthContext, auth service, router with constants, LandingLayout, AppLayout, RouteGuard, Login/Signup (and optionally ForgotPassword, OAuth) in TS. Old app still runs; new app can run in parallel with only auth + shell.

---

### Phase 2: Landing & Public Pages

**Goal:** All landing and public pages in the new structure; single source for shared components.

**Steps:**

1. **Pages**
   - Add pages: `pages/Home`, `pages/About`, `pages/Contact`, `pages/PrivacyPolicy`, `pages/TermsOfService`, `pages/VideoInterviewsPage`, `pages/ResumeAnalysisPage` (landing), `pages/PageNotFound`. Each under `src/pages/...` with optional `components/` subfolder.

2. **Remove duplication**
   - Use **one** shared component for Footer, one for PageNotFound, etc. (e.g. under `components/shared/`). Delete or stop using the duplicate files from the old app (AboutUs, ContactUs, Footer, PageNotFound, PrivacyPolicy, TermsOfService in both root and Landing).

3. **Router**
   - Point landing routes to new page components; keep using LandingLayout.

**Deliverables:** All landing/public routes in TS with page-based structure; no duplicate Footer/PageNotFound/AboutUs etc.

---

### Phase 3: Services Layer & API Consolidation

**Goal:** Every API call goes through a service; no direct fetch/axios in components; endpoints only in constants.

**Steps:**

1. **List all API usages**
   - From the analysis: auth, interview (interviewService already exists), resume analysis, coaching, teacher (classes, slots, assignments, students), student (classes, assignments, interview history, time slots), admin, account/billing, organization, announcements. Create one service file per domain (e.g. `resumeService.ts`, `coachingService.ts`, `teacherService.ts`, `studentService.ts`, `accountService.ts`, `organizationService.ts`).

2. **Implement services**
   - Each service imports axios instance and `*_ENDPOINTS` from constants; exports async functions that return normalized data (or throw). Use `normalizeResponse` where applicable. Add TypeScript interfaces for request/response where possible.

3. **Replace inline API calls**
   - In the **new** codebase (migrated pages), components only call services. When you migrate a page that today uses `fetch` or `axios` directly, its new version calls a service method instead.

4. **Env**
   - No component or service should read `import.meta.env` directly; only config module reads env and exports `Config`.

**Deliverables:** Full services layer in TS; no raw env or endpoint strings in components; interfaces for main APIs.

**Phase 3 completed (current repo):**
- **Types:** `src/types/interview.ts` — `StartInterviewResult`, `PollStatusResult`, `AIResponseData`, `InterviewStreamCallbacks`, etc.
- **Utils:** `src/utils/auth.ts` — `getAuthToken()` for calls that need token (e.g. SSE query param); only config uses `import.meta.env` (env audit done).
- **Interview service:** `src/services/interviewService.ts` — `startInterview`, `getStartTaskStatus`, `getRespondTaskStatus`, `submitResponse`, `pollInterviewStatus`, `postVideoTelemetry`, `submitVideoQuality`, `endInterview`, `getInterviewFeedbackStatus`, `connectToInterviewStream`, `waitForAIResponse`. Uses `Config.FASTAPI_BASE_URL`, `INTERVIEW_ENDPOINTS`, `fastApiClient`; stream URL built in one place. No env or endpoint strings in components.
- **Pattern:** One service per domain; endpoints from constants; Config for base URLs; TypeScript interfaces for request/response.

---

### Phase 4: Dashboard & Core Student Flows

**Goal:** Dashboard and high-traffic student flows in new repo with clean structure.

**Steps:**

1. **Dashboard**
   - Add `pages/Dashboard` (or `pages/Manage`); split current Dashboard.jsx into page + `pages/Dashboard/components/` (e.g. cards, sections). Use services for all data.

2. **Video interview flow**
   - Add `pages/VideoInterview` and `pages/InterviewInterface`. Break current **InterviewInterface.jsx** into:
     - Page component that composes subcomponents and hooks.
     - Hooks: e.g. `useInterviewSession`, `useCommunicationPhase`, `useFreeTierTimer`.
     - Subcomponents under `pages/InterviewInterface/components/`: e.g. phases (Speaking, Comprehension, MCQ), modals, code editor area, video/audio UI.
   - Same idea for VideoInterview.jsx: page + components + hooks.

3. **State**
   - Prefer local state + context only where needed (e.g. interview session). Do not replicate the single giant context; split by feature (e.g. InterviewContext for interview-only state) and keep auth in AuthContext.

4. **Router**
   - Add routes for dashboard, video-interview, interview-interface; use lazy loading and ROUTES constants.

**Deliverables:** Dashboard and interview flows in TS with smaller, testable components and hooks; no 3.7k-line single file.

**Phase 4 completed (current repo):**
- **Dashboard:** `DASHBOARD_ENDPOINTS` in apiEndpoints; `src/types/dashboard.ts`; `src/services/dashboardService.ts` (getLatestStats, getResumeProgress, getPerformanceAnalysis, getClassroomStats, cache, mapVideoReport, mapResumeReport, buildRecentActivity). `pages/Dashboard/index.tsx` uses AuthContext and dashboardService; subcomponents: `DashboardHeader`, `DashboardSkeleton`, `VideoReportsCard`, `ResumeReportsCard`. Performance overview and classroom stats sections wired; report clicks navigate to ROUTES.FEEDBACK (feedback page to be added later).
- **Routes:** `/manage` (Dashboard), `/video-interview` (VideoInterview), `/interview-interface` (InterviewInterface) under AppLayout with lazy loading.
- **Placeholder pages:** `pages/VideoInterview/index.tsx` and `pages/InterviewInterface/index.tsx` (placeholders; full flow and split into components/hooks to be done next).

**Phase 4 continued (interview flow):**
- **Hook:** `src/hooks/useInterviewSession.ts` — connects SSE via `connectToInterviewStream`, exposes `aiMessage`, `status`, `isComplete`, `error`, `isSubmitting`, `submitText(text)`, `endSession()`. Submits via `submitResponse` and polls `getRespondTaskStatus` until completed; parses message from `RespondTaskResult`. Skips SSE when `sessionId` is empty.
- **Types:** `RespondTaskResult` in `types/interview.ts` for respond-status payload.
- **Constants:** `src/constants/interviewTypes.ts` — `INTERVIEW_TYPE_OPTIONS` (Technical, HR, Coding) for type selection.
- **VideoInterview page:** Renders type list; on Start calls `startInterview` → polls `getStartTaskStatus` until completed → navigates to InterviewInterface with `sessionId` and `interviewType`. Uses `user.email` as userId.
- **InterviewInterface page:** Reads `sessionId`/`interviewType` from `location.state`; redirects to `/video-interview` if missing. Uses `useInterviewSession`; minimal UI: status, AI message area, text input + Send, End interview, Back links. No video/audio/code editor in this slice.

**Feedback route & page:**
- **Endpoint:** `FEEDBACK_ENDPOINTS.SESSION_HISTORY` (`get-session-history/`); **types:** `src/types/feedback.ts` (`SessionHistoryResponse`); **service:** `src/services/feedbackService.ts` — `getSessionHistory(params)` with `interview_id`+`interview_type` or `session_id`+`session_type`.
- **Route:** `/feedback` under AppLayout (lazy).
- **Page:** `pages/Feedback/index.tsx` — reads `location.state` (`type: 'video-interview' | 'resume-analysis'`, plus ids/title/date/back). Redirects to dashboard if no state. Video: fetches `getSessionHistory`, shows overall score and feedback summary (strengths, areas to improve); resume: placeholder for future API. Back link to `state.back` or dashboard.

---

### Phase 5: Teacher, Student, Admin & Account

**Goal:** All role-based and account pages migrated.

**Steps:**

1. **Teacher**
   - Pages: TeacherClasses, TeacherClassDetail, ScheduleSlots, CreateTimeSlot, CreateAssignment, StudentsPerformance, TeacherStudentBatch, TeacherStudentDetail, AssignmentSubmissions, etc. Each as `pages/Teacher/...` with optional `components/` subfolder. Use `teacherService` (and shared services where applicable).

2. **Student**
   - Pages: StudentClasses, StudentClassDetail, StudentAssignmentSubmit, StudentInterviewHistory, StudentTimeSlots. Same pattern; use `studentService`.

3. **Admin**
   - Pages: AdminDashboard, UserManagement. Use admin/user services.

4. **Account**
   - AccountDashboard, tabs (BillingPayments, UsageCredits, AccountDetails, DeveloperTab, SettingsTab), modals (UpgradeModal, BuyCreditsModal, etc.). Use `accountService`; shared components in `components/shared/` where appropriate.

5. **Role-based access**
   - Implement layout or route guard that reads role from AuthContext (not localStorage); redirect to the right dashboard (student/teacher/admin) when role is known.

**Deliverables:** All teacher, student, admin, and account routes in TS; role from context; services for all API calls.

**Phase 5 (structure) completed:**
- **Router constants:** `STUDENT_CLASSES` (`/student/classes`), `STUDENT_INTERVIEW_HISTORY` (`/student/interview-history`).
- **Placeholder pages:** `pages/Teacher/Classes`, `Teacher/Schedule`, `Teacher/Students`; `pages/Student/Classes`, `Student/InterviewHistory`; `pages/Admin/Dashboard`, `Admin/Users`; `pages/Account` (uses AuthContext for user/role). Each has title, short “To be migrated” copy, and Back link.
- **Routes (AppLayout):** `/teacher` → children classes, schedule, students; `/student` → children classes, interview-history; `/admin` → children dashboard, users; `/account` → index Account. All lazy-loaded.

---

### Phase 6: Learning, Resume, Feedback & Rest

**Goal:** Learning (arrays, concepts, practice, video solution), resume analysis/generation/history, feedback templates, and remaining screens.

**Phase 6 (structure) completed:**
- **Learning:** `pages/Learning/index.tsx` (hub with link to Arrays), `pages/Learning/Arrays/index.tsx`. Routes: `/learning`, `/learning/arrays` under AppLayout.
- **Resume (app):** `pages/ResumeAnalysisFlow/index.tsx` at `/resume-analysis`, `pages/ResumeGeneration/index.tsx` at `/resume-generation` under AppLayout. (Landing resume stays at `/resume`.)
- **Forgot password:** `pages/Auth/ForgotPassword/index.tsx` at `/forgot-password` (public, LandingLayout). Login page already links to it.

**Steps:**

1. **Learning**
   - Pages: LearningPage, ArraysLearningHub, ConceptLearningPage, PracticePage, VideoSolutionPage. Page-specific components under each page folder. Use learning service(s) and constants.

2. **Resume**
   - ResumeAnalysis, ResumeGeneration, ResumeAnalysisHistory. Use resume service; shared resume components in one place.

3. **Feedback**
   - FeedbackPage, FeedbackRouter, feedback templates. Break large FeedbackTemplate into smaller components; use services for any API calls.

4. **Remaining**
   - PopupForm, PopupTemplate, Coaching, StudyPlans, WrittenTests, SystemCheck, CompleteProfile, OAuth callback, Org login/register, Company admin (if applicable), Announcements (single ClassAnnouncements, remove duplicate folder), any Experimental screens you want to keep. Each as page or shared component as appropriate.

5. **Cleanup**
   - Remove duplicate route (`popup-template`). Ensure every path uses `ROUTES`. Add any missing error boundaries and loading states.

**Deliverables:** Full feature parity in TS; no duplicate components or routes; single place for loading and error UI.

---

### Phase 7: Polish & Decommission Old App

**Goal:** Responsive design, loading/error consistency, and switch to new client.

**Steps:**

1. **Design tokens & responsive**
   - Add global CSS variables (e.g. `styles/global.css`) for colors, typography, spacing. Add responsive breakpoints (e.g. `responsive.css` or Tailwind config) and use them consistently.

2. **Loading states**
   - Replace every ad-hoc spinner with `LoadingFallback` or a small set of shared loading components (e.g. button loading state). Use Suspense for lazy routes.

3. **Error handling**
   - ErrorBoundary at root; RouteError for route/chunk errors; optional chunk-load retry (e.g. lazyWithRetry + reload on chunk error). Remove console.log from auth/guard code.

4. **Env & build**
   - Document and validate three environments (e.g. dev, staging, prod); ensure build and env config work. Optional: add staging config if not done in Phase 0.

5. **Decommission**
   - Point production to Interviewsta-client-TS; archive or retire interviewsta-landing-website when satisfied.

**Deliverables:** Consistent UX, responsive layout, single loading/error strategy, and full cutover to the new TS client.

---

## Part 3: Execution Order Summary

| Phase | Focus | Risk |
|-------|--------|------|
| **0** | Config, constants, API client, utils, LoadingFallback | Low |
| **1** | AuthContext, router, layouts, auth pages | Low |
| **2** | Landing & public pages, remove duplicates | Low |
| **3** | All services + no inline API/env | Medium (touch many call sites when migrating) |
| **4** | Dashboard, VideoInterview, InterviewInterface | High (complex UI; split carefully) |
| **5** | Teacher, Student, Admin, Account | Medium |
| **6** | Learning, Resume, Feedback, rest | Medium |
| **7** | Polish, responsive, decommission | Low |

Recommendation: **Do Phase 0 first** in Interviewsta-client-TS (no migration). Then Phase 1 (auth + shell) and run the new app in parallel with the old one. Migrate one section at a time (e.g. landing in Phase 2, then dashboard + interview in Phase 4) so you can test and roll back without rewriting everything at once.

---

## Part 4: Quick Reference — f-dummy vs Target (Interviewsta-client-TS)

| Area | f-dummy pattern | Apply in Interviewsta-client-TS |
|------|------------------|----------------------------------|
| Config | `config/index` + dev/prod | Phase 0 |
| Constants | apiEndpoints, routerConstants, appConstants | Phase 0 |
| API | Single axios instance, interceptors, Config.API_URL | Phase 0 |
| Services | One per domain, use endpoints + client | Phase 3 |
| Auth | AuthContext, useAuth, Layout redirect | Phase 1 |
| Router | createBrowserRouter, ROUTES, lazyWithRetry, errorElement | Phase 1 |
| Layout | LandingLayout, AppLayout (auth gate) | Phase 1 |
| Loading | Single LoadingFallback | Phase 0 |
| Errors | ErrorBoundary, RouteError | Phase 0 / 7 |
| Pages | pages/Feature with optional components/ | Phases 2, 4, 5, 6 |
| Utils/helpers | serviceUtils, storage, domain helpers | Phase 0, 3 |

This gives you a single place to track **what’s wrong** and **how to fix it in stages** without converting everything at once.
