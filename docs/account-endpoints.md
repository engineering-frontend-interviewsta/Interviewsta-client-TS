# Account & Billing Endpoints

This document describes what each account-related API endpoint expects (method, path, body, query, auth) and what it returns. Base URL is the Django API (`Config.API_URL`). All authenticated requests use `Authorization: Bearer <accessToken>` and `withCredentials: true` where applicable.

---

## Auth (user account)

Defined in `AUTH_ENDPOINTS`; used via `authService` and `nestClient`.


| Endpoint            | Path                    | Method | Auth required             | Request                                                                                                | Response / notes                                                            |
| ------------------- | ----------------------- | ------ | ------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **LOGIN**           | `auth/login/`           | POST   | No                        | Body: `{ email: string, password: string }`                                                            | `{ accessToken, user }` (see `AuthApiResponse`)                             |
| **REGISTER**        | `auth/register/`        | POST   | No                        | Body: `{ name, email, password, roles?: string[], phone?, country? }`. `roles` defaults to `['user']`. | Same as login.                                                              |
| **LOGOUT**          | `auth/logout/`          | POST   | Yes (cookie/token)        | No body (or empty)                                                                                     | —                                                                           |
| **REFRESH**         | `auth/refresh/`         | POST   | Cookie (httpOnly refresh) | No body                                                                                                | `{ accessToken: string }`                                                   |
| **ME**              | `auth/me/`              | GET    | Yes                       | —                                                                                                      | User object: `{ email, name, phone?, country?, role?, roles?, avatarUrl? }` |
| **PATCH_ME**        | `auth/me/`              | PATCH  | Yes                       | Body: partial user (e.g. `name`, `phone`, `country`)                                                   | Updated user. (Defined in constants; confirm usage in backend.)             |
| **FORGOT_PASSWORD** | `auth/forgot-password/` | POST   | No                        | Body: `{ email: string, frontend_url?: string }`                                                       | —                                                                           |
| **GOOGLE**          | `auth/google/`          | POST   | No                        | Body: `{ code: string, redirect_uri: string, role?: string }`. `role` default `'student'`.             | `AuthApiResponse`.                                                          |
| **GITHUB**          | `auth/github/`          | POST   | No                        | Body: `{ code: string, redirect_uri: string, role?: string }`. `role` default `'student'`.             | `AuthApiResponse`.                                                          |


---

## Billing & account

Defined in `BILLING_ENDPOINTS`; used via `accountService` and `adminService`. All require authenticated user unless noted.

### User-facing


| Endpoint              | Path                                | Method | Auth | Request                                                          | Response / notes                                                                                                                                                                                                                                                                                                               |
| --------------------- | ----------------------------------- | ------ | ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ACCOUNT**           | `billing/account/`                  | GET    | Yes  | —                                                                | `BillingAccount`: `{ user?: AccountUser, account?: AccountPlan }`. `AccountUser`: id, email, first_name?, last_name?, username?, date_joined?. `AccountPlan`: tier?, tier_name?, billing_cycle?, total_credits?, remaining_credits?, used_interview_credits?, used_resume_credits?, interviews_equivalent?, month_reset_date?. |
| **PLAN_STATUS**       | `billing/plan-status/`              | GET    | Yes  | —                                                                | `PlanStatus                                                                                                                                                                                                                                                                                                                    |
| **FEEDBACK_ACCESS**   | `billing/feedback-access/`          | GET    | Yes  | —                                                                | `{ can_access_full_feedback?: boolean, tier?: number }`.                                                                                                                                                                                                                                                                       |
| **TRANSACTIONS**      | `billing/transactions/?page={page}` | GET    | Yes  | Query: `page` (number)                                           | `{ results?: TransactionItem[] }`. `TransactionItem`: id, amount?, created_at?, status?, description?, currency?.                                                                                                                                                                                                              |
| **API_KEYS** (list)   | `billing/api-keys/`                 | GET    | Yes  | —                                                                | Array of API key objects.                                                                                                                                                                                                                                                                                                      |
| **API_KEYS** (create) | `billing/api-keys/`                 | POST   | Yes  | Body: `{ label: string }`                                        | Created API key object.                                                                                                                                                                                                                                                                                                        |
| **CREATE_ORDER**      | `billing/create-order/`             | POST   | Yes  | Body: (e.g. plan/product identifiers; confirm with backend)      | Order/session for payment. Not yet used in frontend.                                                                                                                                                                                                                                                                           |
| **VERIFY_PAYMENT**    | `billing/verify-payment/`           | POST   | Yes  | Body: (e.g. order_id / payment_session_id; confirm with backend) | Verification result. Not yet used in frontend.                                                                                                                                                                                                                                                                                 |


### Admin (billing)


| Endpoint              | Path                                   | Method | Auth        | Request                                  | Response / notes                                                                                                                                                                     |
| --------------------- | -------------------------------------- | ------ | ----------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ADMIN_DASHBOARD**   | `billing/admin/dashboard/`             | GET    | Yes (admin) | —                                        | `AdminDashboardData`: overview (total_users, total_interviews, total_resumes, avg_score), users_by_tier, interview_type_breakdown, monthly_trend, top_performers, bottom_performers. |
| **ADMIN_USERS**       | `billing/admin/users/?page={page}`     | GET    | Yes (admin) | Query: `page` (number)                   | `{ count: number, results: AdminUser[] }`. `AdminUser`: id, email, name, date_joined, app_role, interview_count, tier, tier_name, total_credits, remaining_credits, used_credits.    |
| **ADMIN_USER_TIER**   | `billing/admin/users/{userId}/tier/`   | PATCH  | Yes (admin) | Path: `userId`. Body: `{ tier: number }` | `AdminUpdateTierResponse`: id, tier, tier_name, total_credits, remaining_credits.                                                                                                    |
| **ADMIN_USER_DELETE** | `billing/admin/users/{userId}/delete/` | DELETE | Yes (admin) | Path: `userId`                           | No body.                                                                                                                                                                             |


---

## Types reference

- **Auth**: `src/types/auth.ts` — `User`, `AuthApiResponse`, `AuthResult`, `Role`.
- **Account/Billing**: `src/types/account.ts` — `AccountUser`, `AccountPlan`, `BillingAccount`, `TransactionItem`, `PlanStatus`.
- **Admin**: `src/types/admin.ts` — `AdminDashboardData`, `AdminUser`, `AdminUsersResponse`, `AdminUpdateTierResponse`, `AdminPerformer`.

## Services

- **Auth**: `src/services/authService.ts` — login, register, logout, refresh, me, forgotPassword, googleLogin, githubLogin.
- **Account**: `src/services/accountService.ts` — getBillingAccount, getPlanStatus, getFeedbackAccess, getTransactions, getApiKeys, createApiKey.
- **Admin**: `src/services/adminService.ts` — getAdminDashboard, getAdminUsers, updateUserTier, deleteUser.

