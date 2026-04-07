import type { FeedbackTelemetryData } from '../../../types/feedback';
import {
  hasTelemetryRichPayload,
  mapActionPlan,
  mapEnvironmentItems,
  mapGapItems,
  mapHireBreakdown,
  mapImpactItems,
  mapPresenceDimensions,
  mapSpeechStats,
  mapSpeechTimeline,
  mapStrengthItems,
  mapTopFillers,
} from '../telemetryRichReportMappers';
import FeedbackPresenceBodyLanguageSection from './FeedbackPresenceBodyLanguageSection';
import FeedbackSpeechVocalSection from './FeedbackSpeechVocalSection';
import FeedbackEnvironmentSection from './FeedbackEnvironmentSection';
import FeedbackStrengthsPriorityGapsSection from './FeedbackStrengthsPriorityGapsSection';
import FeedbackHireProbabilitySection from './FeedbackHireProbabilitySection';
import FeedbackActionPlanSection from './FeedbackActionPlanSection';
import type { SpeechTimelineBlock } from './FeedbackSpeechVocalSection';

export type FeedbackTelemetryRichReportProps = {
  telemetry: FeedbackTelemetryData;
};

function timelineLabelSeconds(totalSec: number): string {
  if (totalSec <= 0) return 'Speech timeline (telemetry windows)';
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  const span = m > 0 ? `${m}m ${s}s` : `${s}s`;
  return `Speech activity by telemetry window (0–${span} analysed)`;
}

function fallbackTimelineBlocks(): SpeechTimelineBlock[] {
  return [{ kind: 'pause', widthPercent: 100, label: 'No timeline segments' }];
}

/** Renders sections 02–07 when `telemetry` includes the corresponding backend fields. */
export default function FeedbackTelemetryRichReport({ telemetry }: FeedbackTelemetryRichReportProps) {
  if (!hasTelemetryRichPayload(telemetry)) return null;

  const presenceCards = mapPresenceDimensions(telemetry.presence_dimensions);
  const envItems = mapEnvironmentItems(telemetry.environment_dimension?.items);
  const strengthItems = mapStrengthItems(telemetry.strengths);
  const gapItems = mapGapItems(telemetry.gaps);
  const hire = telemetry.hire_probability;
  const hireBreakdown = hire ? mapHireBreakdown(hire) : [];
  const impactTips = hire ? mapImpactItems(hire) : [];
  const actions = mapActionPlan(telemetry.action_plan);
  const sd = telemetry.speech_dimension;
  let speechBlocks = mapSpeechTimeline(telemetry.timeline);
  const lastDur =
    telemetry.timeline && telemetry.timeline.length > 0
      ? Math.max(...telemetry.timeline.map((t) => t.duration))
      : 0;
  if (speechBlocks.length === 0 && (telemetry.timeline?.length || sd)) {
    speechBlocks = fallbackTimelineBlocks();
  }

  const showPresence = presenceCards.length > 0;
  const showSpeech = Boolean(sd || (telemetry.timeline && telemetry.timeline.length > 0));
  const showEnvironment = envItems.length > 0;
  const showStrGaps = telemetry.strengths != null || telemetry.gaps != null;
  const showHire = Boolean(hire && (hire.probability != null || hire.verdict || hire.narrative));
  const showActions = actions.length > 0;

  return (
    <div className="feedback-page__telemetry-rich">
      {showPresence ? <FeedbackPresenceBodyLanguageSection cards={presenceCards} /> : null}

      {showSpeech ? (
        <FeedbackSpeechVocalSection
          stats={mapSpeechStats(sd)}
          timelineLabel={timelineLabelSeconds(lastDur)}
          timeline={speechBlocks}
          fillers={mapTopFillers(sd)}
          callout={sd?.narrative ? <>{sd.narrative}</> : null}
        />
      ) : null}

      {showEnvironment ? <FeedbackEnvironmentSection items={envItems} /> : null}

      {showStrGaps ? (
        <FeedbackStrengthsPriorityGapsSection strengths={strengthItems} gaps={gapItems} />
      ) : null}

      {showHire && hire ? (
        <FeedbackHireProbabilitySection
          verdictLines={
            hire.verdict ? (
              <span className="hire-verdict-plain">{hire.verdict}</span>
            ) : (
              <span className="hire-verdict-plain">Hire probability summary</span>
            )
          }
          hireProbabilityPercent={
            hire.probability != null && !Number.isNaN(Number(hire.probability))
              ? `${Math.round(Number(hire.probability) * 10) / 10}%`
              : '—'
          }
          breakdown={hireBreakdown}
          narrative={hire.narrative?.trim() ? hire.narrative : null}
          tips={impactTips}
        />
      ) : null}

      {showActions ? <FeedbackActionPlanSection actions={actions} /> : null}
    </div>
  );
}
