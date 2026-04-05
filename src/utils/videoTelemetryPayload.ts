import type { InterviewVideoTelemetrySample } from '../types/videoTelemetry';
import type { LiveMeasurements } from '../experimental/types/liveMeasurements';

/** Default interval aligned with backend expectation (~20s). */
export const VIDEO_TELEMETRY_INTERVAL_MS = 20_000;

function environmentPayload(
  env: NonNullable<LiveMeasurements['environment']>
): NonNullable<InterviewVideoTelemetrySample['environment']> {
  return {
    lighting: env.lighting,
    camera: env.camera,
    background: env.background,
    attire: env.attire,
    audio: env.audio,
    overall_score: env.overallScore,
    suggestions: env.suggestions,
    critical_issues: env.criticalIssues,
  };
}

export function buildInterviewVideoTelemetrySample(
  live: LiveMeasurements,
  analysisStartedAtMs: number
): InterviewVideoTelemetrySample {
  const now = Date.now();
  const env = live.environment;

  return {
    time: new Date(now).toISOString(),
    duration: Math.max(0, Math.round((now - analysisStartedAtMs) / 1000)),
    environment: env ? environmentPayload(env) : null,
    lighting: env?.lighting ?? null,
    camera: env?.camera ?? null,
    background: env?.background ?? null,
    audio: env?.audio ?? null,
    presence: { ...live.presence },
    speech: { ...live.speech },
    overall_score: env?.overallScore ?? null,
    suggestions: env?.suggestions ?? null,
    critical_issues: env?.criticalIssues ?? null,
  };
}
