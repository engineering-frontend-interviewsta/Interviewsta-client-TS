import { useEffect, useState } from 'react';
import { getPlanStatus } from '../services/accountService';
import type { PlanStatus } from '../types/account';

export function usePlanStatus(): { planStatus: PlanStatus | null; loading: boolean } {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getPlanStatus();
        if (!mounted) return;
        setPlanStatus(res);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return { planStatus, loading };
}

