import type { ReactNode } from 'react';
import { useAuthCheck } from '../hooks/useAuthCheck';
import LoadingFallback from '../components/shared/LoadingFallback';

interface RouteGuardProps {
  children: ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isChecking } = useAuthCheck();

  if (isChecking) {
    return <LoadingFallback />;
  }

  return <>{children}</>;
}
