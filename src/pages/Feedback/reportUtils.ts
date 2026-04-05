import type { InterviewFeedback } from '../../types/feedback';

/** Rubric: 0–100 = evaluated (including real zero); -1 or non-number = not evaluated. */
export function isRubricEvaluated(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Average of evaluated rubric leaves only; ignores -1 and invalid values. */
export function computeSleeveScore(metrics: Record<string, number>): number {
  const valid = Object.values(metrics).filter(isRubricEvaluated);
  if (valid.length === 0) return 0;
  return valid.reduce((acc, v) => acc + v, 0) / valid.length;
}

/** Coding template: verbal communication is scored under Language quality, not under Code Quality. */
export const CODE_QUALITY_SLEEVE_KEY = 'Code Quality & Communication';
const VERBAL_COMM_SUBKEY = 'Verbal Communication';

export function filterCodeQualityMetricsForDisplay(
  metrics: Record<string, number>,
): Record<string, number> {
  const { [VERBAL_COMM_SUBKEY]: _removed, ...rest } = metrics;
  return rest;
}

export function formatSleeveTitleForDisplay(sleeveKey: string): string {
  if (sleeveKey === CODE_QUALITY_SLEEVE_KEY) return 'Code Quality';
  return formatSleeveLabel(sleeveKey);
}

export function computeSleeveScoreForDisplay(sleeveKey: string, metrics: Record<string, number>): number {
  const m = sleeveKey === CODE_QUALITY_SLEEVE_KEY ? filterCodeQualityMetricsForDisplay(metrics) : metrics;
  return computeSleeveScore(m);
}

/** True when this sleeve has at least one evaluated (0–100) display metric, including real 0%. */
export function sleeveHasEvaluatedDisplay(sleeveKey: string, metrics: Record<string, number>): boolean {
  const display =
    sleeveKey === CODE_QUALITY_SLEEVE_KEY ? filterCodeQualityMetricsForDisplay(metrics) : metrics;
  return Object.values(display).some(isRubricEvaluated);
}

export const PROBLEM_SOLVING_SLEEVE_KEY = 'Problem Solving & Technical Logic';

/** Stable ordering for technical sleeves (matches score breakdown). */
export function orderTechnicalItemsEntries(
  entries: [string, Record<string, number>][],
): [string, Record<string, number>][] {
  const byKey = new Map(entries);
  const out: [string, Record<string, number>][] = [];
  const pushIf = (k: string) => {
    const v = byKey.get(k);
    if (v) out.push([k, v]);
  };
  pushIf(PROBLEM_SOLVING_SLEEVE_KEY);
  pushIf(CODE_QUALITY_SLEEVE_KEY);
  for (const [k, v] of entries) {
    if (k === PROBLEM_SOLVING_SLEEVE_KEY || k === CODE_QUALITY_SLEEVE_KEY) continue;
    out.push([k, v]);
  }
  return out;
}

export type ScoreTier = 'high' | 'mid' | 'low' | 'concern';

/** Tier for 0–100 style percentage scores (theme-mapped bar / pill styling). */
export function scorePercentTier(score: number): ScoreTier {
  if (score >= 72) return 'high';
  if (score >= 55) return 'mid';
  if (score >= 40) return 'low';
  return 'concern';
}

export function scoreTierLabel(tier: ScoreTier): string {
  switch (tier) {
    case 'high':
      return 'Strong signal';
    case 'mid':
      return 'On track';
    case 'low':
      return 'Room to grow';
    default:
      return 'Focus area';
  }
}

export function formatSleeveLabel(key: string): string {
  return key.replace(/_/g, ' ');
}

function normalizeMetricKey(input: string): string {
  return (input || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeScore(score: unknown): number | null {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  if (score < 0) return null;
  return Math.min(100, Math.max(0, score));
}

/**
 * Alias match on rubric leaves, optionally skipping sleeves where language-like names are misleading.
 * Mirrors `interviewsta-backend/src/Data/feedback_items.json` (e.g. `fi-coding-i`): that template nests
 * "Verbal Communication" and "Syntactic Fluency" under `Code Quality & Communication`, but the report
 * strips verbal from the Code Quality card and treats syntactic fluency as code — so universal
 * Communication / Grammar from the LLM must still show for standard technical interviews.
 */
function hasAliasedMetricOutsideSleeves(
  items: Record<string, Record<string, number>> | undefined,
  aliases: string[],
  skipSleeveKeys: ReadonlySet<string>,
): boolean {
  if (!items || typeof items !== 'object') return false;
  const normalizedAliases = aliases.map(normalizeMetricKey);
  return Object.entries(items).some(([sleeveKey, metrics]) => {
    if (skipSleeveKeys.has(sleeveKey)) return false;
    return Object.keys(metrics || {}).some((metricKey) => {
      const normalizedMetric = normalizeMetricKey(metricKey);
      return normalizedAliases.some(
        (alias) =>
          normalizedMetric === alias ||
          normalizedMetric.includes(alias) ||
          alias.includes(normalizedMetric),
      );
    });
  });
}

const SKIP_LANGUAGE_ALIAS_SLEEVES = new Set<string>([CODE_QUALITY_SLEEVE_KEY]);

/** Sub-metrics (outside Code Quality sleeve) that mean the rubric already scores communication. */
const COMMUNICATION_SUBKEY_ALIASES = [
  'communication',
  'verbalcommunication',
  'professionalcommunication',
  'clarityofexpression',
  'clarity',
  'tone',
];

/**
 * Sub-metrics outside Code Quality. Omit bare "vocabulary" so "Technical Vocabulary" (AIML) does not
 * suppress Grammar; vocabulary-dedicated sleeves still use title matching below.
 */
const GRAMMAR_SUBKEY_ALIASES = [
  'grammar',
  'grammarcorrectness',
  'sentenceconstruction',
  'syntacticfluency',
  'languageaccuracy',
  'vocabularyknowledge',
  'contextualword',
  'wordselection',
  'spelling',
];

function sleeveTitleIndicatesCommunicationCoverage(sleeveKey: string): boolean {
  if (sleeveKey === CODE_QUALITY_SLEEVE_KEY) return false;
  const s = normalizeMetricKey(sleeveKey);
  if (s.includes('communication')) return true;
  if (s.includes('verbal')) return true;
  if (s.includes('conversational')) return true;
  return false;
}

function sleeveTitleIndicatesGrammarCoverage(sleeveKey: string): boolean {
  const s = normalizeMetricKey(sleeveKey);
  if (s.includes('grammar')) return true;
  if (s.includes('vocabulary')) return true;
  if (s.includes('languageaccuracy')) return true;
  if (s.includes('language') && s.includes('accuracy')) return true;
  if (s.includes('syntactic')) return true;
  return false;
}

/** True when rubric already exposes communication-style sleeves or leaves — hide duplicate LLM Communication. */
export function rubricCoversCommunication(
  items: Record<string, Record<string, number>> | undefined,
): boolean {
  if (hasAliasedMetricOutsideSleeves(items, COMMUNICATION_SUBKEY_ALIASES, SKIP_LANGUAGE_ALIAS_SLEEVES))
    return true;
  if (!items || typeof items !== 'object') return false;
  return Object.keys(items).some((k) => sleeveTitleIndicatesCommunicationCoverage(k));
}

/** True when rubric already exposes grammar / language-accuracy sleeves or leaves — hide duplicate LLM Grammar. */
export function rubricCoversGrammar(items: Record<string, Record<string, number>> | undefined): boolean {
  if (hasAliasedMetricOutsideSleeves(items, GRAMMAR_SUBKEY_ALIASES, SKIP_LANGUAGE_ALIAS_SLEEVES)) return true;
  if (!items || typeof items !== 'object') return false;
  return Object.keys(items).some((k) => sleeveTitleIndicatesGrammarCoverage(k));
}

/**
 * Dashboard / history often only has `sleeveScores` (no nested rubric leaves). Uses the same sleeve-title
 * rules as full feedback, but not sub-metric alias matching — aligns list chips with the report page when
 * sleeves are present; if `sleeveScores` is missing, returns false so universal scores still show.
 */
export function rubricCoversCommunicationFromSleeveKeys(
  sleeveScores: Record<string, number> | undefined | null,
): boolean {
  if (!sleeveScores || typeof sleeveScores !== 'object') return false;
  return Object.keys(sleeveScores).some((k) => sleeveTitleIndicatesCommunicationCoverage(k));
}

export function rubricCoversGrammarFromSleeveKeys(
  sleeveScores: Record<string, number> | undefined | null,
): boolean {
  if (!sleeveScores || typeof sleeveScores !== 'object') return false;
  return Object.keys(sleeveScores).some((k) => sleeveTitleIndicatesGrammarCoverage(k));
}

export function getUniversalScoreSupplements(data: {
  items?: Record<string, Record<string, number>>;
  communicationScore?: number;
  grammarScore?: number;
  communicationMetrics?: { overall?: number } | null;
  grammarMetrics?: { overall?: number } | null;
}): Array<{ key: 'communicationScore' | 'grammarScore'; label: string; score: number }> {
  const supplements: Array<{ key: 'communicationScore' | 'grammarScore'; label: string; score: number }> = [];

  const hasCommunicationInItems = rubricCoversCommunication(data.items);
  const hasGrammarInItems = rubricCoversGrammar(data.items);

  const communicationScore = normalizeScore(
    data.communicationMetrics?.overall ?? data.communicationScore,
  );
  if (!hasCommunicationInItems && communicationScore != null) {
    supplements.push({
      key: 'communicationScore',
      label: 'Communication',
      score: communicationScore,
    });
  }

  const grammarScore = normalizeScore(data.grammarMetrics?.overall ?? data.grammarScore);
  if (!hasGrammarInItems && grammarScore != null) {
    supplements.push({
      key: 'grammarScore',
      label: 'Grammar',
      score: grammarScore,
    });
  }

  return supplements;
}

/** Normalized language metrics; sub-fields only when the API provided a finite score. */
export type NormalizedCommunicationMetrics = {
  overall: number;
  clarity?: number;
  fluency?: number;
  responseRelevance?: number;
  structure?: number;
};

export type NormalizedGrammarMetrics = {
  overall: number;
  grammarCorrectness?: number;
  sentenceConstruction?: number;
  vocabularyControl?: number;
  conciseness?: number;
};

export function normalizeCommunicationMetrics(
  group: InterviewFeedback['communicationMetrics'] | undefined,
): NormalizedCommunicationMetrics | null {
  if (!group) return null;
  const overall = normalizeScore(group.overall);
  if (overall == null) return null;
  const out: NormalizedCommunicationMetrics = { overall };
  const c = normalizeScore(group.clarity);
  const f = normalizeScore(group.fluency);
  const r = normalizeScore(group.responseRelevance);
  const s = normalizeScore(group.structure);
  if (c != null) out.clarity = c;
  if (f != null) out.fluency = f;
  if (r != null) out.responseRelevance = r;
  if (s != null) out.structure = s;
  return out;
}

export function normalizeGrammarMetrics(
  group: InterviewFeedback['grammarMetrics'] | undefined,
): NormalizedGrammarMetrics | null {
  if (!group) return null;
  const overall = normalizeScore(group.overall);
  if (overall == null) return null;
  const out: NormalizedGrammarMetrics = { overall };
  const gc = normalizeScore(group.grammarCorrectness);
  const sc = normalizeScore(group.sentenceConstruction);
  const vc = normalizeScore(group.vocabularyControl);
  const co = normalizeScore(group.conciseness);
  if (gc != null) out.grammarCorrectness = gc;
  if (sc != null) out.sentenceConstruction = sc;
  if (vc != null) out.vocabularyControl = vc;
  if (co != null) out.conciseness = co;
  return out;
}

export type LanguageMetricsView =
  | { kind: 'aggregate'; overall: number; label: 'communication' | 'grammar' }
  | { kind: 'breakdown'; domain: 'communication' | 'grammar'; metrics: NormalizedCommunicationMetrics | NormalizedGrammarMetrics };

export function languageMetricsViewOverall(view: LanguageMetricsView): number {
  return view.kind === 'aggregate' ? view.overall : view.metrics.overall;
}

function communicationSubsArray(m: NormalizedCommunicationMetrics): number[] {
  return [m.clarity, m.fluency, m.responseRelevance, m.structure].filter(
    (v): v is number => typeof v === 'number',
  );
}

function grammarSubsArray(m: NormalizedGrammarMetrics): number[] {
  return [m.grammarCorrectness, m.sentenceConstruction, m.vocabularyControl, m.conciseness].filter(
    (v): v is number => typeof v === 'number',
  );
}

/** One row when only `overall` exists (legacy payloads); otherwise show every sub the API sent. */
export function getCommunicationMetricsView(
  group: InterviewFeedback['communicationMetrics'] | undefined,
): LanguageMetricsView | null {
  const n = normalizeCommunicationMetrics(group);
  if (!n) return null;
  const subs = communicationSubsArray(n);
  if (subs.length === 0) return { kind: 'aggregate', overall: n.overall, label: 'communication' };
  return { kind: 'breakdown', domain: 'communication', metrics: n };
}

export function getGrammarMetricsView(
  group: InterviewFeedback['grammarMetrics'] | undefined,
): LanguageMetricsView | null {
  const n = normalizeGrammarMetrics(group);
  if (!n) return null;
  const subs = grammarSubsArray(n);
  if (subs.length === 0) return { kind: 'aggregate', overall: n.overall, label: 'grammar' };
  return { kind: 'breakdown', domain: 'grammar', metrics: n };
}

/**
 * Composite for the hero ring: communication + grammar (when present) + each interview category.
 * Excludes Verbal Communication from Code Quality to align with Language quality section.
 */
export function computeCompositeScorePercent(data: InterviewFeedback): number | null {
  const parts: number[] = [];
  const items = data.items && typeof data.items === 'object' ? data.items : undefined;
  const commOv =
    normalizeCommunicationMetrics(data.communicationMetrics)?.overall ??
    normalizeScore(data.communicationScore);
  const gramOv =
    normalizeGrammarMetrics(data.grammarMetrics)?.overall ?? normalizeScore(data.grammarScore);
  if (commOv != null && !rubricCoversCommunication(items)) parts.push(commOv);
  if (gramOv != null && !rubricCoversGrammar(items)) parts.push(gramOv);

  const itemsObj = items ?? {};
  for (const [key, raw] of Object.entries(itemsObj)) {
    const m = raw && typeof raw === 'object' ? (raw as Record<string, number>) : {};
    parts.push(computeSleeveScoreForDisplay(key, m));
  }

  if (parts.length === 0) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
