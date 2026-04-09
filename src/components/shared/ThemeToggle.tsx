import { useRef, useState, useEffect } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../../context/ThemeContext';

const LABELS: Record<ThemePreference, string> = {
  system: 'Match system',
  light: 'Light',
  dark: 'Dark',
};

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className={`theme-toggle ${className}`.trim()} ref={wrapRef}>
      <button
        type="button"
        className="theme-toggle__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Theme: ${LABELS[preference]}. ${resolvedTheme} appearance. Choose theme.`}
        title={`Theme: ${LABELS[preference]}`}
      >
        <Icon size={18} strokeWidth={2} aria-hidden />
      </button>
      {open && (
        <div className="theme-toggle__menu" role="menu">
          {(['system', 'light', 'dark'] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="menuitem"
              className={`theme-toggle__item${preference === p ? ' theme-toggle__item--active' : ''}`}
              onClick={() => {
                setPreference(p);
                setOpen(false);
              }}
            >
              {p === 'system' && <Monitor size={16} strokeWidth={2} aria-hidden />}
              {p === 'light' && <Sun size={16} strokeWidth={2} aria-hidden />}
              {p === 'dark' && <Moon size={16} strokeWidth={2} aria-hidden />}
              <span>{LABELS[p]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
