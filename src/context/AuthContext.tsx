import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as authService from '../services/authService';
import { setAccessToken, setRole, clearAuthStorage } from '../utils/storage';
import type { AuthResult, User } from '../types/auth';
import { ROUTES } from '../constants/routerConstants';

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
    phone?: string,
    country?: string
  ) => Promise<AuthResult>;
  loginWithGoogle: (code: string, role?: string) => Promise<AuthResult>;
  loginWithGithub: (code: string, role?: string) => Promise<AuthResult>;
}

const defaultState: AuthState = {
  user: null,
  role: null,
  isLoading: true,
};

const defaultContextValue: AuthContextValue = {
  ...defaultState,
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginWithGithub: async () => ({ success: false }),
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultState);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.me();
      const userData = response.data;
      setRole(userData.role);
      setState({
        user: authService.toUser(userData),
        role: userData.role,
        isLoading: false,
      });
    } catch {
      try {
        const refreshResponse = await authService.refresh();
        const token = refreshResponse.data.access;
        setAccessToken(token);
        const meResponse = await authService.me();
        const userData = meResponse.data;
        setRole(userData.role);
        setState({
          user: authService.toUser(userData),
          role: userData.role,
          isLoading: false,
        });
      } catch {
        clearAuthStorage();
        setState({ user: null, role: null, isLoading: false });
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authService.login(email, password);
      const { access, user: u } = response.data;
      setAccessToken(access);
      setRole(u.role);
      const user = authService.toUser(u);
      setState({ user, role: u.role, isLoading: false });
      return { success: true, user, role: u.role };
    } catch (err: unknown) {
      const error =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
          ? (err.response as { data?: { error?: string } }).data?.error
          : null;
      return { success: false, error: error ?? 'Login failed' };
    }
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role = 'student',
      phone = '',
      country = ''
    ): Promise<AuthResult> => {
      try {
        const response = await authService.register(name, email, password, role, phone, country);
        const { access, user: u } = response.data;
        setAccessToken(access);
        setRole(u.role);
        const user = authService.toUser(u);
        setState({ user, role: u.role, isLoading: false });
        return { success: true, user, role: u.role };
      } catch (err: unknown) {
        const error =
          err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
            ? (err.response as { data?: string | { error?: string } }).data
            : null;
        const message = typeof error === 'string' ? error : error?.error ?? 'Registration failed';
        return { success: false, error: message };
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (code: string, role = 'student'): Promise<AuthResult> => {
      try {
        const redirectUri =
          typeof window !== 'undefined' ? `${window.location.origin}${ROUTES.AUTH_CALLBACK}` : '';
        const response = await authService.googleLogin(code, redirectUri, role);
        const { access, user: u } = response.data;
        setAccessToken(access);
        setRole(u.role);
        const user = authService.toUser(u);
        setState({ user, role: u.role, isLoading: false });
        return { success: true, user, role: u.role };
      } catch (err: unknown) {
        const error =
          err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'data' in err.response
            ? (err.response as { data?: { error?: string } }).data?.error
            : null;
        return { success: false, error: error ?? 'Google login failed' };
      }
    },
    []
  );

  const loginWithGithub = useCallback(
    async (code: string, role = 'student'): Promise<AuthResult> => {
      try {
        const redirectUri =
          typeof window !== 'undefined' ? `${window.location.origin}${ROUTES.AUTH_CALLBACK}` : '';
        const response = await authService.githubLogin(code, redirectUri, role);
        const { access, user: u } = response.data;
        setAccessToken(access);
        setRole(u.role);
        const user = authService.toUser(u);
        setState({ user, role: u.role, isLoading: false });
        return { success: true, user, role: u.role };
      } catch (err: unknown) {
        const error =
          err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'data' in err.response
            ? (err.response as { data?: { error?: string } }).data?.error
            : null;
        return { success: false, error: error ?? 'GitHub login failed' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      clearAuthStorage();
      setState({ user: null, role: null, isLoading: false });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    loginWithGoogle,
    loginWithGithub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
