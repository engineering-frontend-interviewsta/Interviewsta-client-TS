import type {
  FeedbackTelemetryData,
  FeedbackTelemetryEnvironmentItem,
  FeedbackTelemetryGap,
  FeedbackTelemetryPresenceDimension,
  FeedbackTelemetrySpeechDimension,
  FeedbackTelemetryStrength,
  FeedbackTelemetryTimelineEntry,
} from '../../types/feedback';
import type { PresenceCardData, PresenceStatRow } from './components/FeedbackPresenceBodyLanguageSection';
import type { EnvironmentItem } from './components/FeedbackEnvironmentSection';
import type { StrengthGapItem } from './components/FeedbackStrengthsPriorityGapsSection';
import type { ActionPlanItem } from './components/FeedbackActionPlanSection';
import type { HireBreakdownItem, HireTipCard } from './components/FeedbackHireProbabilitySection';
import type { SpeechStatCell, SpeechTimelineBlock, FillerTag } from './components/FeedbackSpeechVocalSection';

export function hasTelemetryRichPayload(td: FeedbackTelemetryData | null | undefined): boolean {
  if (td == null || typeof td !== 'object') return false;
  return Boolean(
    (td.timeline && td.timeline.length > 0) ||
      td.speech_dimension ||
      (td.presence_dimensions && td.presence_dimensions.length > 0) ||
      (td.environment_dimension?.items && td.environment_dimension.items.length > 0) ||
      (td.strengths && td.strengths.length > 0) ||
      (td.gaps && td.gaps.length > 0) ||
      td.hire_probability ||
      (td.action_plan && td.action_plan.length > 0)
  );
}

function badgeFromScore(score?: number): PresenceCardData['badgeClass'] {
  if (score == null || Number.isNaN(score)) return 'badge-amber';
  if (score >= 85) return 'badge-green';
  if (score >= 65) return 'badge-amber';
  return 'badge-red';
}

function humanizeKey(key: string): string {
  return key
    .replace(/_pct\b/gi, ' %')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatStatValue(key: string, value: number): string {
  const k = key.toLowerCase();
  if (k.includes('ms') && k.includes('gap')) {
    return `${Math.round(value / 1000)}s`;
  }
  if (k.includes('angle')) {
    return value.toFixed(2);
  }
  if (k.includes('percent') || k.endsWith('_pct') || k.includes('_pct')) {
    return `${Math.round(value)}%`;
  }
  if (value >= 0 && value <= 1 && !k.includes('count') && !k.includes('event')) {
    return `${(value * 100).toFixed(0)}%`;
  }
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

export function mapPresenceDimensions(dimensions?: FeedbackTelemetryPresenceDimension[]): PresenceCardData[] {
  if (!dimensions?.length) return [];
  return dimensions.map((d) => {
    const stats: PresenceStatRow[] = [];
    const raw = d.stats ?? {};
    for (const [key, val] of Object.entries(raw)) {
      if (typeof val !== 'number') continue;
      stats.push({
        label: humanizeKey(key),
        value: formatStatValue(key, val),
      });
    }
    const score = d.score ?? 0;
    return {
      title: d.name ?? 'Presence',
      subtitle: 'Telemetry-derived metrics',
      scoreLabel: `${Math.round(score)}%`,
      badgeClass: badgeFromScore(score),
      stats,
      narrative: d.narrative ?? '',
    };
  });
}

const ENV_ICON_BY_LABEL: Record<string, string> = {
  lighting: '💡',
  'camera angle': '📷',
  background: '🏠',
  'background noise': '🔊',
  microphone: '🎙',
  attire: '👔',
};

function envDotClass(verdict?: string): EnvironmentItem['dotClass'] {
  const v = (verdict ?? '').toLowerCase();
  if (v.includes('good') || v.includes('excellent')) return 'env-good';
  if (v.includes('bad') || v.includes('poor')) return 'env-bad';
  return 'env-warn';
}

export function mapEnvironmentItems(items?: FeedbackTelemetryEnvironmentItem[]): EnvironmentItem[] {
  if (!items?.length) return [];
  return items.map((it) => {
    const label = it.label ?? 'Item';
    const key = label.toLowerCase();
    return {
      icon: ENV_ICON_BY_LABEL[key] ?? '📋',
      label,
      verdict: it.verdict ? it.verdict.charAt(0).toUpperCase() + it.verdict.slice(1) : '—',
      dotClass: envDotClass(it.verdict),
      note: it.note ?? '',
    };
  });
}

export function mapStrengthItems(items?: FeedbackTelemetryStrength[]): StrengthGapItem[] {
  if (!items?.length) return [];
  return items.map((s) => ({
    icon: sourceIcon(s.source),
    title: s.title ?? 'Strength',
    body: s.detail ?? '',
  }));
}

export function mapGapItems(items?: FeedbackTelemetryGap[]): StrengthGapItem[] {
  if (!items?.length) return [];
  return items.map((g) => ({
    icon: '⚠',
    title: g.title ?? 'Gap',
    body: g.detail ?? '',
  }));
}

function sourceIcon(source?: string): string {
  const s = (source ?? '').toLowerCase();
  if (s.includes('speech')) return '💬';
  if (s.includes('presence')) return '🎯';
  if (s.includes('environment')) return '🏠';
  return '✓';
}

function scoreTone(score: number): HireBreakdownItem['valueClass'] {
  if (score >= 80) return 'val-green';
  if (score >= 65) return 'val-amber';
  return 'val-red';
}

export function mapHireBreakdown(hire: FeedbackTelemetryData['hire_probability']): HireBreakdownItem[] {
  if (!hire?.breakdown) return [];
  const b = hire.breakdown;
  const out: HireBreakdownItem[] = [];
  const push = (label: string, v?: number) => {
    if (v == null || Number.isNaN(v)) return;
    out.push({
      label,
      value: `${Math.round(v * 10) / 10}%`,
      valueClass: scoreTone(v),
    });
  };
  push('Speech', b.speech);
  push('Presence', b.presence);
  push('Environment', b.environment);
  push('Technical', b.technical);
  return out;
}

const IMPACT_VARIANTS: HireTipCard['variant'][] = ['green', 'blue', 'amber'];

export function mapImpactItems(hire: FeedbackTelemetryData['hire_probability']): HireTipCard[] {
  const raw = hire?.impact_items;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((row, i) => {
    const o = row as Record<string, unknown>;
    const label =
      String(o.label ?? o.title ?? o.heading ?? 'Impact lever');
    const value = String(o.value ?? o.delta ?? o.gain ?? '—');
    const sub = String(o.sub ?? o.subtitle ?? o.detail ?? 'hire probability gain');
    return {
      variant: IMPACT_VARIANTS[i % IMPACT_VARIANTS.length],
      label,
      value,
      sub,
    };
  });
}

function formatSessionSpan(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function mapSpeechTimeline(entries?: FeedbackTelemetryTimelineEntry[]): SpeechTimelineBlock[] {
  if (!entries?.length) return [];
  const sorted = [...entries].sort((a, b) => a.duration - b.duration);
  const last = sorted[sorted.length - 1];
  const total = last.duration;
  if (total <= 0) return [];

  const blocks: SpeechTimelineBlock[] = [];
  let prev = 0;
  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    const end = row.duration;
    const span = end - prev;
    if (span <= 0) {
      prev = end;
      continue;
    }
    const pct = (span / total) * 100;
    const sp = row.speech;
    const wpm = sp?.currentWpm ?? sp?.currentWPM ?? 0;
    let kind: SpeechTimelineBlock['kind'] = 'speak';
    if (wpm === 0) kind = 'pause';
    else if (wpm >= 170) kind = 'fast';
    const label = `${formatSessionSpan(prev)}–${formatSessionSpan(end)}`;
    blocks.push({ kind, widthPercent: pct, label });
    prev = end;
  }
  return blocks;
}

function speechStatToneFpm(fpm: number): SpeechStatCell['tone'] {
  if (fpm <= 4) return 'green';
  if (fpm <= 8) return 'amber';
  return 'red';
}

function speechStatToneWpm(wpm: number): SpeechStatCell['tone'] {
  if (wpm >= 120 && wpm <= 160) return 'green';
  if (wpm >= 90 && wpm < 200) return 'amber';
  return 'red';
}

export function mapSpeechStats(sd?: FeedbackTelemetrySpeechDimension | null): SpeechStatCell[] {
  const avg = sd?.avg_wpm ?? 0;
  const fpm = sd?.fillers_per_minute ?? 0;
  const dead = sd?.dead_pauses ?? 0;
  const conf = sd?.transcription_conf ?? 0;
  return [
    {
      value: String(Math.round(avg * 10) / 10),
      label: 'avg WPM',
      hint: avg >= 120 && avg <= 160 ? '✓ Near ideal band' : 'Aim for 120–160 WPM',
      tone: speechStatToneWpm(avg),
    },
    {
      value: String(Math.round(fpm * 10) / 10),
      label: 'fillers / min',
      hint: fpm <= 4 ? '✓ Low filler rate' : 'Target under 4/min',
      tone: speechStatToneFpm(fpm),
    },
    {
      value: String(dead),
      label: 'dead pauses',
      hint: '>8s silence segments',
      tone: dead === 0 ? 'green' : 'amber',
    },
    {
      value: `${Math.round(conf)}%`,
      label: 'transcription confidence',
      hint: conf >= 85 ? '✓ Clear audio' : 'Improve mic / room',
      tone: conf >= 85 ? 'green' : 'amber',
    },
  ];
}

export function mapTopFillers(sd?: FeedbackTelemetrySpeechDimension): FillerTag[] {
  const raw = sd?.top_fillers;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((row) => {
      const o = row as { word?: string; count?: number };
      if (o.word != null && o.count != null) {
        return { text: `"${o.word}" — ${o.count}×` };
      }
      return null;
    })
    .filter((x): x is FillerTag => x != null);
}

export function mapActionPlan(
  plan?: FeedbackTelemetryData['action_plan']
): ActionPlanItem[] {
  if (!plan?.length) return [];
  const sorted = [...plan].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  return sorted.map((a) => {
    const { tag, tagLabel } = mapUrgencyToTag(a.urgency);
    return {
      title: a.title ?? 'Action',
      body: a.detail ?? '',
      tag,
      tagLabel,
    };
  });
}

function mapUrgencyToTag(urgency?: string): Pick<ActionPlanItem, 'tag' | 'tagLabel'> {
  const u = (urgency ?? '').toLowerCase().replace(/-/g, '_');
  if (u.includes('today') || u.includes('now') || u === 'immediate') {
    return { tag: 'now', tagLabel: 'Start today' };
  }
  if (u.includes('month') || u.includes('habit') || u.includes('weeks')) {
    return { tag: 'month', tagLabel: urgency ?? 'Longer horizon' };
  }
  return { tag: 'week', tagLabel: urgency?.replace(/_/g, ' ') ?? 'This week' };
}
