import { useEffect, useRef } from 'react';

/** Odd count so one bar sits at the visual center (matches Glee animation layout). */
const BAR_COUNT = 33;
const CENTER = (BAR_COUNT - 1) / 2;
const RING_COUNT = Math.round(CENTER) + 1;

const FLAT_HEIGHT = 0.07;
const SMOOTH_GLEE = 0.2;
const SMOOTH_FLAT = 0.24;

export interface MicWaveformProps {
  /** Mic off or interview ended */
  inactive?: boolean;
  /** While AI TTS plays: synthetic centered waveform */
  gleeSpeaking?: boolean;
  className?: string;
}

/**
 * Flat baseline while you’re on mic; animated symmetric waveform only while Glee speaks.
 */
export default function MicWaveform({
  inactive = false,
  gleeSpeaking = false,
  className = '',
}: MicWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heightsRef = useRef<number[]>(Array.from({ length: BAR_COUNT }, () => FLAT_HEIGHT));
  const ringSmoothedRef = useRef<number[]>(Array.from({ length: RING_COUNT }, () => FLAT_HEIGHT));
  const gleePhaseRef = useRef(0);
  const gleeNoiseRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const smooth = heightsRef.current;
    const ringSmooth = ringSmoothedRef.current;

    const tick = () => {
      const bars = containerRef.current?.querySelectorAll<HTMLDivElement>('[data-wave-bar]');
      if (!bars?.length) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const flatTarget = inactive ? FLAT_HEIGHT * 0.35 : FLAT_HEIGHT;

      if (inactive || !gleeSpeaking) {
        for (let i = 0; i < BAR_COUNT; i += 1) {
          smooth[i] += (flatTarget - smooth[i]) * SMOOTH_FLAT;
          const el = bars[i];
          if (el) el.style.height = `${Math.max(2, smooth[i] * 100)}%`;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      gleePhaseRef.current += 0.055;
      gleeNoiseRef.current =
        gleeNoiseRef.current * 0.92 + (Math.random() - 0.5) * 0.045;
      const t = gleePhaseRef.current;
      const noise = gleeNoiseRef.current;
      for (let d = 0; d < RING_COUNT; d += 1) {
        const env = Math.exp(-(d * d) / (2 * 6.2 * 6.2));
        const a = Math.sin(t * 1.15 + d * 0.38);
        const b = Math.sin(t * 2.35 - d * 0.21);
        const c = Math.sin(t * 0.72 + d * d * 0.04);
        const mix = 0.5 + 0.5 * (a * 0.48 + b * 0.32 + c * 0.2);
        const jitter = noise * 0.12 * env;
        const target =
          FLAT_HEIGHT * 0.65 + env * (0.18 + 0.62 * mix) + jitter;
        ringSmooth[d] += (Math.min(1, target) - ringSmooth[d]) * SMOOTH_GLEE;
      }
      for (let i = 0; i < BAR_COUNT; i += 1) {
        const d = Math.min(RING_COUNT - 1, Math.round(Math.abs(i - CENTER)));
        const target = ringSmooth[d];
        smooth[i] += (target - smooth[i]) * SMOOTH_GLEE;
        const el = bars[i];
        if (el) el.style.height = `${Math.max(3, smooth[i] * 100)}%`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inactive, gleeSpeaking]);

  const wrapClass = [
    'interview-interface__waveform',
    inactive && 'interview-interface__waveform--inactive',
    gleeSpeaking && !inactive && 'interview-interface__waveform--glee',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClass} ref={containerRef} aria-hidden>
      <div className="interview-interface__waveform-inner">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            key={i}
            data-wave-bar
            className="interview-interface__waveform-bar"
            style={{ height: `${FLAT_HEIGHT * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
