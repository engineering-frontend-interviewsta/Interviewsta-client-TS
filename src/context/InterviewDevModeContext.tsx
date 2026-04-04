import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'interviewsta_dev_mode';
/** Legacy key from earlier Dev text labeling; read once for migration. */
const LEGACY_STORAGE_KEY = 'interviewsta_dev_text_interview';

function readStored(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return true;
    if (localStorage.getItem(LEGACY_STORAGE_KEY) === '1') return true;
    return false;
  } catch {
    return false;
  }
}

function persist(value: boolean) {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

type InterviewDevModeContextValue = {
  devMode: boolean;
  setDevMode: (value: boolean) => void;
  toggleDevMode: () => void;
};

const InterviewDevModeContext = createContext<InterviewDevModeContextValue | null>(null);

export function InterviewDevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevModeState] = useState(readStored);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
      if (localStorage.getItem(LEGACY_STORAGE_KEY) === '1') {
        localStorage.setItem(STORAGE_KEY, '1');
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setDevMode = useCallback((value: boolean) => {
    setDevModeState(value);
    persist(value);
  }, []);

  const toggleDevMode = useCallback(() => {
    setDevModeState((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ devMode, setDevMode, toggleDevMode }),
    [devMode, setDevMode, toggleDevMode]
  );

  return (
    <InterviewDevModeContext.Provider value={value}>{children}</InterviewDevModeContext.Provider>
  );
}

export function useInterviewDevMode(): InterviewDevModeContextValue {
  const ctx = useContext(InterviewDevModeContext);
  if (!ctx) {
    throw new Error('useInterviewDevMode must be used within InterviewDevModeProvider');
  }
  return ctx;
}
