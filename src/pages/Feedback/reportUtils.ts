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

function hasAliasedMetric(
  items: Record<string, Record<string, number>> | undefined,
  aliases: string[],
): boolean {
  if (!items || typeof items !== 'object') return false;
  const normalizedAliases = aliases.map(normalizeMetricKey);
  return Object.values(items).some((metrics) =>
    Object.keys(metrics || {}).some((metricKey) => {
      const normalizedMetric = normalizeMetricKey(metricKey);
      return normalizedAliases.some(
        (alias) =>
          normalizedMetric === alias ||
          normalizedMetric.includes(alias) ||
          alias.includes(normalizedMetric),
      );
    }),
  );
}

export function getUniversalScoreSupplements(data: {
  items?: Record<string, Record<string, number>>;
  communicationScore?: number;
  grammarScore?: number;
  communicationMetrics?: { overall?: number } | null;
  grammarMetrics?: { overall?: number } | null;
}): Array<{ key: 'communicationScore' | 'grammarScore'; label: string; score: number }> {
  const supplements: Array<{ key: 'communicationScore' | 'grammarScore'; label: string; score: number }> = [];

  const hasCommunicationInItems = hasAliasedMetric(data.items, [
    'communication',
    'verbalcommunication',
    'professionalcommunication',
    'clarityofexpression',
    'clarity',
    'tone',
  ]);
  const hasGrammarInItems = hasAliasedMetric(data.items, [
    'grammar',
    'grammarcorrectness',
    'sentenceconstruction',
    'syntacticfluency',
    'languageaccuracy',
  ]);

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

export function normalizeCommunicationMetrics(
  group:
    | {
        overall: number;
        clarity: number;
        fluency: number;
        responseRelevance: number;
        structure: number;
      }
    | undefined,
):
  | {
      overall: number;
      clarity: number;
      fluency: number;
      responseRelevance: number;
      structure: number;
    }
  | null {
  if (!group) return null;
  const overall = normalizeScore(group.overall);
  const clarity = normalizeScore(group.clarity);
  const fluency = normalizeScore(group.fluency);
  const responseRelevance = normalizeScore(group.responseRelevance);
  const structure = normalizeScore(group.structure);
  if (
    overall == null ||
    clarity == null ||
    fluency == null ||
    responseRelevance == null ||
    structure == null
  ) {
    return null;
  }
  return { overall, clarity, fluency, responseRelevance, structure };
}

export function normalizeGrammarMetrics(
  group:
    | {
        overall: number;
        grammarCorrectness: number;
        sentenceConstruction: number;
        vocabularyControl: number;
        conciseness: number;
      }
    | undefined,
):
  | {
      overall: number;
      grammarCorrectness: number;
      sentenceConstruction: number;
      vocabularyControl: number;
      conciseness: number;
    }
  | null {
  if (!group) return null;
  const overall = normalizeScore(group.overall);
  const grammarCorrectness = normalizeScore(group.grammarCorrectness);
  const sentenceConstruction = normalizeScore(group.sentenceConstruction);
  const vocabularyControl = normalizeScore(group.vocabularyControl);
  const conciseness = normalizeScore(group.conciseness);
  if (
    overall == null ||
    grammarCorrectness == null ||
    sentenceConstruction == null ||
    vocabularyControl == null ||
    conciseness == null
  ) {
    return null;
  }
  return {
    overall,
    grammarCorrectness,
    sentenceConstruction,
    vocabularyControl,
    conciseness,
  };
}

/**
 * Composite for the hero ring: communication + grammar (when present) + each interview category.
 * Excludes Verbal Communication from Code Quality to align with Language quality section.
 */
export function computeCompositeScorePercent(data: InterviewFeedback): number | null {
  const parts: number[] = [];
  const comm = normalizeCommunicationMetrics(data.communicationMetrics);
  const gram = normalizeGrammarMetrics(data.grammarMetrics);
  if (comm) parts.push(comm.overall);
  if (gram) parts.push(gram.overall);

  const items = data.items && typeof data.items === 'object' ? data.items : {};
  for (const [key, raw] of Object.entries(items)) {
    const m = raw && typeof raw === 'object' ? (raw as Record<string, number>) : {};
    parts.push(computeSleeveScoreForDisplay(key, m));
  }

  if (parts.length === 0) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
