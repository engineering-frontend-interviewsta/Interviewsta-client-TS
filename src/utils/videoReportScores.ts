import type { VideoInterviewReport } from '../types/dashboard';
import { formatSleeveTitleForDisplay } from '../pages/Feedback/reportUtils';

const ORDERED_SLEEVES = ['Problem Solving & Technical Logic', 'Code Quality & Communication'] as const;

function shortSleeveLabel(sleeveKey: string): string {
  if (sleeveKey.includes('Problem Solving')) return 'Problem';
  if (sleeveKey.includes('Code Quality')) return 'Code';
  const w = sleeveKey.split(/\s+/)[0];
  return w && w.length <= 8 ? w : `${w?.slice(0, 6) ?? 'Area'}…`;
}

/** Rows for dashboard / history: each scored dimension with a compact label. */
export function buildVideoReportScoreRows(report: VideoInterviewReport): Array<{
  fullLabel: string;
  shortLabel: string;
  score: number;
}> {
  const rows: Array<{ fullLabel: string; shortLabel: string; score: number }> = [];

  const comm = report.communicationOverall;
  if (typeof comm === 'number' && Number.isFinite(comm) && comm >= 0) {
    rows.push({
      fullLabel: 'Communication',
      shortLabel: 'Comm',
      score: Math.round(comm),
    });
  }

  const gram = report.grammarOverall;
  if (typeof gram === 'number' && Number.isFinite(gram) && gram >= 0) {
    rows.push({
      fullLabel: 'Grammar',
      shortLabel: 'Gram',
      score: Math.round(gram),
    });
  }

  const sleeves = report.sleeveScores ?? {};
  const seen = new Set<string>();

  for (const k of ORDERED_SLEEVES) {
    const v = sleeves[k];
    if (typeof v === 'number' && Number.isFinite(v)) {
      seen.add(k);
      rows.push({
        fullLabel: formatSleeveTitleForDisplay(k),
        shortLabel: shortSleeveLabel(k),
        score: Math.round(v),
      });
    }
  }

  for (const [k, v] of Object.entries(sleeves)) {
    if (seen.has(k)) continue;
    if (typeof v !== 'number' || !Number.isFinite(v)) continue;
    rows.push({
      fullLabel: formatSleeveTitleForDisplay(k),
      shortLabel: shortSleeveLabel(k),
      score: Math.round(v),
    });
  }

  if (rows.length === 0 && report.score != null && Number.isFinite(report.score)) {
    rows.push({
      fullLabel: 'Overall',
      shortLabel: 'Avg',
      score: Math.round(report.score),
    });
  }

  return rows;
}
