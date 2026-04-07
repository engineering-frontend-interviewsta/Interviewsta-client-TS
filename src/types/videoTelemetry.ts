import type { EnvironmentReport } from '../experimental/types/EnvironmentAnalyzer';
import type { LiveMeasurements } from '../experimental/types/liveMeasurements';

/**
 * POST `/interview/{session_id}/video-telemetry` body (snake_case, matches FastAPI model).
 */
export interface InterviewVideoTelemetrySample {
  /** ISO 8601 timestamp from client. */
  time: string;
  /** Seconds since analysis started; backend accepts int, float, or str. */
  duration?: number | string | null;
  environment?: Record<string, unknown> | null;
  audio?: EnvironmentReport['audio'] | Record<string, unknown> | null;
  background?: EnvironmentReport['background'] | Record<string, unknown> | null;
  camera?: EnvironmentReport['camera'] | Record<string, unknown> | null;
  critical_issues?: unknown[] | null;
  lighting?: EnvironmentReport['lighting'] | Record<string, unknown> | null;
  overall_score?: number | null;
  suggestions?: string[] | null;
  presence?: LiveMeasurements['presence'] | Record<string, unknown> | null;
  speech?: LiveMeasurements['speech'] | Record<string, unknown> | null;
}
