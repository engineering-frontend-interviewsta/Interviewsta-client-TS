/** User shape from backend (auth/me, login, register) */
export interface User {
  email: string;
  displayName: string;
  phone: string;
  country: string;
}

/** Backend auth response (login, register, google, github) */
export interface AuthApiResponse {
  access: string;
  user: {
    email: string;
    name: string;
    phone?: string;
    country?: string;
    role: string;
  };
}

/** Result returned by login/register in AuthContext */
export interface AuthResult {
  success: boolean;
  user?: User;
  role?: string;
  error?: string;
}

export type Role = 'student' | 'teacher' | 'admin';
