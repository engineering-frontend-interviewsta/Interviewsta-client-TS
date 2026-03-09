import { useAuth } from '../context/AuthContext';

/**
 * For RouteGuard: exposes whether auth is still being checked (initial load).
 * Use isAuthenticated from useAuth() for redirect logic.
 */
export function useAuthCheck() {
  const { isLoading, user } = useAuth();
  return {
    isChecking: isLoading,
    isAuthenticated: !!user,
  };
}
