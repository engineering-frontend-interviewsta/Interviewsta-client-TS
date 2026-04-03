/** Average of numeric metrics; ignores -1 (not evaluated). */
export function computeSleeveScore(metrics: Record<string, number>): number {
  const valid = Object.values(metrics).filter((v) => v !== -1);
  if (valid.length === 0) return 0;
  return valid.reduce((acc, v) => acc + v, 0) / valid.length;
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

  const hasCommunicationInRubric = hasAliasedMetric(data.items, [
    'communication',
    'verbalcommunication',
    'professionalcommunication',
    'clarityofexpression',
    'clarity',
    'tone',
  ]);
  const hasGrammarInRubric = hasAliasedMetric(data.items, [
    'grammar',
    'grammarcorrectness',
    'sentenceconstruction',
    'syntacticfluency',
    'languageaccuracy',
  ]);

  const communicationScore = normalizeScore(
    data.communicationMetrics?.overall ?? data.communicationScore,
  );
  if (!hasCommunicationInRubric && communicationScore != null) {
    supplements.push({
      key: 'communicationScore',
      label: 'Communication',
      score: communicationScore,
    });
  }

  const grammarScore = normalizeScore(data.grammarMetrics?.overall ?? data.grammarScore);
  if (!hasGrammarInRubric && grammarScore != null) {
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
