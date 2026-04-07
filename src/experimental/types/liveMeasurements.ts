import type { EnvironmentReport } from './EnvironmentAnalyzer';

/** One-second tick snapshot for live UI and video telemetry (presence + speech + environment when ready). */
export interface LiveMeasurements {
  presence: {
    hasSamples: boolean;
    gazeDirection: 'camera' | 'screen' | 'down' | 'away' | 'unknown';
    gazeConfidence: number;
    headYawDeg: number;
    headPitchDeg: number;
    headRollDeg: number;
    spineAngleDeg: number;
    isSlouching: boolean;
    browRaise: number;
    lipCompression: number;
    jawTension: number;
    overallStress: number;
    snapshotCount: number;
    faceTouchCount: number;
    hairTouchCount: number;
  };
  speech: {
    rmsDb: number;
    snrDb: number;
    noiseFloorDb: number;
    clipping: boolean;
    currentWpm: number;
    fillerCount: number;
    speakingTimeMs: number;
    segmentCount: number;
    totalWords: number;
    latestSegmentText: string;
    webSpeechActive: boolean;
    /** Populated on video telemetry ticks: new finals, else interim, else averaged live `currentWpm` samples for the interval. */
    currIntSegmentCounts?: number;
    currIntSegmentWpm?: number[];
    currIntSegmentWords?: number[];
  };
  environment: EnvironmentReport | null;
}
