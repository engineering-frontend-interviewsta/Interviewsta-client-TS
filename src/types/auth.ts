/** User shape from backend (auth/me, login, register) */
export interface User {
  email: string;
  displayName: string;
  phone: string;
  country: string;
}

/** Backend auth response (login, register, google, github) */
export interface AuthApiResponse {
  accessToken: string;
  /** Optional refresh token (present on login/register/refresh when supported by backend) */
  refreshToken?: string;
  user: {
    email: string;
    name: string;
    phone?: string;
    country?: string;
    /** @deprecated Prefer roles */
    role?: string;
    roles?: string[];
    avatarUrl?: string;
  };
}

/** Result returned by login/register in AuthContext */
export interface AuthResult {
  success: boolean;
  user?: User;
  /** First role for redirect/backward compat */
  role?: string;
  roles?: string[];
  error?: string;
}

export type Role = 'student' | 'teacher' | 'admin';
