# Interviewsta Client — TypeScript Best Practices

This document captures the coding standards and best practices for the **Interviewsta-client-TS** codebase. All contributors should read and follow these guidelines to keep the codebase consistent, maintainable, and type-safe.

---

## Table of Contents

1. [TypeScript Fundamentals](#1-typescript-fundamentals)
2. [Types and Interfaces](#2-types-and-interfaces)
3. [Component Patterns](#3-component-patterns)
4. [Hooks](#4-hooks)
5. [Services and API Layer](#5-services-and-api-layer)
6. [State Management](#6-state-management)
7. [Routing and Guards](#7-routing-and-guards)
8. [Constants and Configuration](#8-constants-and-configuration)
9. [Error Handling](#9-error-handling)
10. [Styling](#10-styling)
11. [File and Folder Structure](#11-file-and-folder-structure)
12. [Performance](#12-performance)
13. [Naming Conventions](#13-naming-conventions)
14. [Code Quality and Tooling](#14-code-quality-and-tooling)

---

## 1. TypeScript Fundamentals

### Enable and respect strict mode

The project uses `strict: true`, `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax` in `tsconfig.app.json`. Never disable these flags or add `@ts-ignore` to work around a type error — fix the root cause instead.

```ts
// Bad
// @ts-ignore
const result = someUntypedFunction();

// Good — add a proper type or cast with a comment explaining why
const result = someUntypedFunction() as ExpectedReturnType;
```

### Prefer `unknown` over `any`

`any` silently disables type checking. Use `unknown` and narrow it explicitly.

```ts
// Bad
function handleError(err: any) {
  console.log(err.message);
}

// Good
function handleError(err: unknown) {
  if (err instanceof Error) {
    console.log(err.message);
  }
}
```

### Use `import type` for type-only imports

The compiler option `verbatimModuleSyntax` requires this. It also makes the intent clear and avoids accidental runtime imports.

```ts
// Bad
import { User, login } from '../services/authService';

// Good
import type { User } from '../types/auth';
import { login } from '../services/authService';
```

### Avoid type assertions unless necessary

Prefer type narrowing (guards, `instanceof`, `in`) over `as`. When an assertion is unavoidable, add a comment explaining why.

```ts
// Bad
const user = data as User;

// Good — narrow first
if (isUser(data)) {
  const user = data; // typed as User
}
```

---

## 2. Types and Interfaces

### Use `interface` for object shapes, `type` for unions and aliases

```ts
// Object shape → interface
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Union → type alias
type Role = 'student' | 'teacher' | 'admin';

// Computed / mapped types → type alias
type PartialProfile = Partial<UserProfile>;
```

### Prefer string unions and `as const` over `enum`

Enums produce runtime artifacts and can behave unexpectedly with `verbatimModuleSyntax`. Use string literal unions or `as const` objects instead.

```ts
// Avoid
enum InterviewStatus {
  Pending = 'pending',
  Active = 'active',
}

// Preferred — union
type InterviewStatus = 'pending' | 'active' | 'completed';

// Preferred — as const (when you need the values at runtime)
const INTERVIEW_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

type InterviewStatus = (typeof INTERVIEW_STATUS)[keyof typeof INTERVIEW_STATUS];
```

### Co-locate domain types in `src/types/`

Each domain has its own file (`auth.ts`, `interview.ts`, `dashboard.ts`, etc.). Add new types to the relevant file rather than defining them inline inside a component or service.

### Keep types narrow — avoid over-widening

```ts
// Bad — too wide
interface ApiResponse {
  data: object;
}

// Good — specific
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
```

### Use generics for reusable shapes

```ts
// src/utils/serviceUtils.ts pattern
interface NormalizedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function normalizeResponse<T>(raw: unknown): NormalizedResponse<T> { ... }
```

---

## 3. Component Patterns

### One component per file, default export for route components

Route-level pages use a default export so React's lazy loading works without extra configuration.

```ts
// src/pages/Dashboard/index.tsx
export default function DashboardPage() { ... }
```

Shared/reusable components may use named exports.

### Type props explicitly — never use implicit `any` or `{}`

```ts
// Bad
function Button(props: any) { ... }

// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, disabled = false, variant = 'primary' }: ButtonProps) { ... }
```

### Keep components focused — extract sub-components when a component grows

If a page component exceeds ~150 lines or contains distinct visual sections, extract them into `pages/<Feature>/components/`. This mirrors the existing pattern throughout the codebase.

### Use `React.FC` sparingly

Prefer plain function declarations with explicit prop types. `React.FC` adds implicit `children` in older React versions and can obscure the component's actual contract.

```ts
// Preferred
function Card({ title }: { title: string }) { ... }

// Acceptable when the type is reused elsewhere
const Card: React.FC<CardProps> = ({ title }) => { ... };
```

### Memoize only when there is a measured performance problem

Avoid wrapping every component in `React.memo` or every callback in `useCallback` by default. Profile first, then optimize.

---

## 4. Hooks

### Name custom hooks with the `use` prefix

```ts
// Good
export function usePlanStatus() { ... }
export function useInterviewSession() { ... }
```

### Return a typed result object from complex hooks

Returning a plain object (not an array) makes the API self-documenting and easier to extend.

```ts
interface UseInterviewSessionResult {
  session: InterviewSession | null;
  isLoading: boolean;
  startSession: () => Promise<void>;
  endSession: () => void;
}

export function useInterviewSession(): UseInterviewSessionResult { ... }
```

### Declare all `useEffect` dependencies honestly

Never suppress the `exhaustive-deps` ESLint rule with a comment unless you have a well-understood reason. Wrap stable callbacks in `useCallback` instead.

```ts
// Bad
useEffect(() => {
  fetchData(userId);
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// Good
const fetchData = useCallback(async () => { ... }, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Clean up side effects

Always return a cleanup function from `useEffect` when the effect sets up subscriptions, timers, or event listeners.

```ts
useEffect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id);
}, [poll]);
```

### Keep hooks single-purpose

A hook that manages media devices should not also handle API calls. Compose multiple focused hooks inside a larger orchestration hook (e.g., `useInterviewSession` composes `useMediaDevices` and `useSpeechCapture`).

---

## 5. Services and API Layer

### One service module per domain

Services live in `src/services/` and are named `<domain>Service.ts`. Each exports plain async functions — not classes.

```ts
// src/services/interviewService.ts
export async function getInterviewSession(id: string): Promise<InterviewSession> {
  const url = INTERVIEW_ENDPOINTS.SESSION(id);
  const response = await fastApiClient.get<InterviewSession>(url);
  return response.data;
}
```

### Always use endpoint constants — never hardcode URLs

All API paths live in `src/constants/apiEndpoints.ts`. Use template functions for parameterized paths.

```ts
// Bad
const response = await nestClient.get(`/interviews/${id}/feedback`);

// Good
const response = await nestClient.get(INTERVIEW_ENDPOINTS.FEEDBACK(id));
```

### Type Axios responses explicitly

```ts
// Bad
const response = await nestClient.get('/dashboard/stats');
const stats = response.data; // any

// Good
const response = await nestClient.get<DashboardStats>('/dashboard/stats');
const stats = response.data; // DashboardStats
```

### Use `normalizeResponse` for standard `{ success, message, data }` payloads

```ts
import { normalizeResponse } from '../utils/serviceUtils';

const raw = await nestClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
const { data } = normalizeResponse<AuthTokens>(raw.data);
```

### Throw typed errors for known failure cases

```ts
// src/services/interviewService.ts pattern
export class InterviewAccessTokenError extends Error {
  code: 'MISSING_TOKEN' | 'EXPIRED_TOKEN';

  constructor(code: 'MISSING_TOKEN' | 'EXPIRED_TOKEN') {
    super('Interview access token error');
    this.code = code;
  }
}
```

Callers can then use `instanceof` to branch on specific error types rather than parsing error message strings.

### Never put business logic inside Axios interceptors

Interceptors in `src/api/axiosInstance.ts` handle cross-cutting concerns only: attaching auth headers, refreshing tokens on 401, and redirecting on auth failure. Domain logic belongs in services.

---

## 6. State Management

### Use `AuthContext` for global auth state only

`AuthContext` is the single global store. Do not add unrelated state (theme, feature flags, UI state) to it.

### Prefer local state for UI-only concerns

```ts
// Good — local state for a modal toggle
const [isOpen, setIsOpen] = useState(false);
```

### Use `useCallback` and `useMemo` to stabilize references passed as props or deps

```ts
const handleSubmit = useCallback(async () => {
  await submitForm(formData);
}, [formData]);
```

### Avoid `sessionStorage` / `localStorage` for reactive state

The codebase uses `sessionStorage.getItem('refreshDashboard')` as an ad hoc invalidation flag. Prefer explicit state or a callback prop to communicate between pages. Use storage only for persistence across page reloads.

---

## 7. Routing and Guards

### Use `ROUTES` constants for all navigation

Never hardcode path strings. Import from `src/constants/routerConstants.ts`.

```ts
// Bad
navigate('/dashboard');

// Good
import { ROUTES } from '../constants/routerConstants';
navigate(ROUTES.DASHBOARD);
```

### Protect authenticated routes at the layout level

`AppLayout` redirects unauthenticated users to `/login`. Any new authenticated route should be nested under `AppLayout` in `src/routes/routes.tsx`.

### Lazy-load all page components

Use `lazyWithRetry` (not bare `React.lazy`) for page-level imports to handle stale chunk errors after deployments.

```ts
import { lazyWithRetry } from '../utils/lazyWithRetry';

const DashboardPage = lazyWithRetry(() => import('../pages/Dashboard'));
```

---

## 8. Constants and Configuration

### Use `as const` for all constant maps

```ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
```

### Read environment variables only through `src/config/index.ts`

Never access `import.meta.env` directly in components or services. Add new variables to the `Config` object.

```ts
// Bad
const apiUrl = import.meta.env.VITE_API_URL;

// Good
import { Config } from '../config';
const apiUrl = Config.API_URL;
```

---

## 9. Error Handling

### Handle errors at the boundary closest to the user

Pages and hooks should catch errors from service calls and translate them into user-facing state (`errorMessage`, `toast`, etc.). Do not let raw `Error` objects reach JSX.

```ts
try {
  const data = await getInterviewSession(id);
  setSession(data);
} catch (err) {
  if (err instanceof InterviewAccessTokenError) {
    setError('Your session has expired. Please rejoin.');
  } else {
    setError('Something went wrong. Please try again.');
  }
}
```

### Use `ErrorBoundary` for unexpected render-time errors

Wrap page-level subtrees in `src/components/shared/ErrorBoundary` to prevent a single component crash from taking down the whole app.

### Narrow `unknown` errors before accessing properties

```ts
// Bad
} catch (err: any) {
  setError(err.response.data.message);
}

// Good
} catch (err) {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    setError(err.response.data.message as string);
  } else {
    setError('An unexpected error occurred.');
  }
}
```

---

## 10. Styling

### Use Tailwind utility classes as the primary styling tool

Prefer Tailwind classes for layout, spacing, color, and typography. Avoid writing custom CSS for things Tailwind already covers.

```tsx
// Preferred
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">

// Avoid for simple cases
<div className="card-wrapper"> {/* then define .card-wrapper in CSS */}
```

### Use co-located CSS files for complex, component-specific styles

When a component requires styles that are too verbose or dynamic for inline Tailwind, create a `<ComponentName>.css` file in the same directory. Use BEM-like naming to avoid collisions.

```css
/* InterviewPanel.css */
.interview-panel__header { ... }
.interview-panel__header--active { ... }
```

### Use CSS custom properties (design tokens) for theme values

All theme colors, radii, and shadows are defined as CSS variables in `src/index.css`. Reference them rather than hardcoding hex values.

```css
/* Bad */
color: #7c3aed;

/* Good */
color: var(--color-primary);
```

---

## 11. File and Folder Structure

```
src/
├── api/              # Axios instances and interceptors only
├── components/
│   └── shared/       # App-wide reusable components (ErrorBoundary, LoadingFallback, etc.)
├── config/           # Environment-based configuration
├── constants/        # Route paths, API endpoints, app-wide constants
├── context/          # React context providers (global state only)
├── data/             # Static JSON / typed data files
├── hooks/            # Reusable custom hooks
├── layout/           # Route layout components
├── pages/
│   └── <Feature>/
│       ├── index.tsx         # Route component (default export)
│       ├── <Feature>.css     # Page-specific styles (if needed)
│       └── components/       # Sub-components used only by this page
├── routes/           # Router config and route guards
├── services/         # API call functions, one file per domain
├── types/            # TypeScript types and interfaces, one file per domain
└── utils/            # Pure utility functions
```

### Rules

- **Never** import from a sibling page's `components/` folder. If a component is needed in two pages, move it to `src/components/shared/`.
- Keep `src/api/` limited to Axios configuration. No business logic.
- Keep `src/utils/` for pure, stateless helpers with no React dependencies.

---

## 12. Performance

### Lazy-load all routes

All page components must be wrapped in `lazyWithRetry`. This is already the pattern in `src/routes/routes.tsx` — maintain it for every new route.

### Avoid large inline objects and arrays in JSX

Objects and arrays created inline in JSX are recreated on every render, causing unnecessary re-renders in child components.

```tsx
// Bad — new array reference every render
<Select options={['a', 'b', 'c']} />

// Good — stable reference
const OPTIONS = ['a', 'b', 'c'] as const;
<Select options={OPTIONS} />
```

### Avoid blocking the main thread in event handlers

Move heavy computations (audio processing, large data transforms) to `useEffect` or a Web Worker, not inside `onClick` or `onChange` handlers.

### Use `Promise.all` for independent parallel requests

```ts
// Bad — sequential
const stats = await getDashboardStats();
const interviews = await getRecentInterviews();

// Good — parallel
const [stats, interviews] = await Promise.all([
  getDashboardStats(),
  getRecentInterviews(),
]);
```

---

## 13. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `InterviewPanel.tsx` |
| Hook file | camelCase with `use` prefix | `useInterviewSession.ts` |
| Service file | camelCase with `Service` suffix | `interviewService.ts` |
| Type/interface file | camelCase by domain | `interview.ts` |
| Constant file | camelCase | `apiEndpoints.ts` |
| CSS file | matches component name | `InterviewPanel.css` |
| React component | PascalCase | `function InterviewPanel()` |
| Hook | camelCase, `use` prefix | `function useInterviewSession()` |
| Interface | PascalCase | `interface InterviewSession` |
| Type alias | PascalCase | `type InterviewStatus` |
| Constant object | SCREAMING_SNAKE_CASE | `INTERVIEW_ENDPOINTS` |
| Boolean variable | `is` / `has` / `can` prefix | `isLoading`, `hasError`, `canSubmit` |
| Event handler prop | `on` prefix | `onSubmit`, `onClose` |
| Event handler implementation | `handle` prefix | `handleSubmit`, `handleClose` |

---

## 14. Code Quality and Tooling

### Run ESLint before committing

The project uses ESLint 9 with `typescript-eslint` and React hooks rules. Fix all warnings and errors — do not suppress them with inline comments unless absolutely necessary and documented.

### Do not commit commented-out code

Use git to track history. Commented-out code adds noise and confusion. Delete it.

### Keep functions small and single-purpose

If a function exceeds ~40 lines or does more than one thing, split it.

### Avoid magic numbers and strings

```ts
// Bad
if (credits < 5) { ... }

// Good
const MINIMUM_CREDITS_REQUIRED = 5;
if (credits < MINIMUM_CREDITS_REQUIRED) { ... }
```

### Write self-documenting code — add comments only for non-obvious intent

```ts
// Bad comment — restates the code
// Increment the counter
count++;

// Good comment — explains the why
// VAD fires multiple events per utterance; debounce prevents duplicate submissions
const debouncedSubmit = useMemo(() => debounce(submit, 300), [submit]);
```

### Keep `package.json` dependencies clean

- Do not add a new dependency for something already achievable with existing libraries or native browser APIs.
- Move packages to `devDependencies` if they are only used at build time.
- Audit for unused dependencies periodically.

---

*Last updated: March 2026*
