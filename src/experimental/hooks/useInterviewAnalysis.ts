/**
 * Wires PresenceAnalyzer + SpeechAnalyzer + EnvironmentAnalyzer for an interview session.
 * MediaPipe (face + pose) starts after a delay so the camera preview stays responsive.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { PresenceAnalyzer, type PresenceReport } from '../types/PresenceAnalyzer';
import { SpeechAnalyzer, type SpeechReport } from '../types/SpeechAnalyzer';
import { EnvironmentAnalyzer, type EnvironmentReport } from '../types/EnvironmentAnalyzer';
import type { LiveMeasurements } from '../types/liveMeasurements';
import { postVideoTelemetry } from '../../services/interviewService';
import {
  buildInterviewVideoTelemetrySample,
  VIDEO_TELEMETRY_INTERVAL_MS,
} from '../../utils/videoTelemetryPayload';

export type { LiveMeasurements } from '../types/liveMeasurements';

export interface FullAnalysisReport {
  presence: PresenceReport;
  speech: SpeechReport;
  environment: EnvironmentReport;
  compositeScore: number;
  generatedAt: number;
}

export interface UseInterviewAnalysisOptions {
  /** When set, POSTs telemetry to FastAPI on `VIDEO_TELEMETRY_INTERVAL_MS` while analysis runs. */
  videoTelemetrySessionId?: string | null;
  videoTelemetryIntervalMs?: number;
}

export interface UseInterviewAnalysisReturn {
  isReady: boolean;
  isRunning: boolean;
  error: string | null;
  liveMeasurements: LiveMeasurements;
  startAnalysis: (videoEl: HTMLVideoElement, stream: MediaStream) => Promise<void>;
  stopAnalysis: () => Promise<FullAnalysisReport>;
}

function defaultLiveMeasurements(): LiveMeasurements {
  return {
    presence: {
      hasSamples: false,
      gazeDirection: 'unknown',
      gazeConfidence: 0,
      headYawDeg: 0,
      headPitchDeg: 0,
      headRollDeg: 0,
      spineAngleDeg: 0,
      isSlouching: false,
      browRaise: 0,
      lipCompression: 0,
      jawTension: 0,
      overallStress: 0,
      snapshotCount: 0,
      faceTouchCount: 0,
      hairTouchCount: 0,
    },
    speech: {
      rmsDb: 0,
      snrDb: 0,
      noiseFloorDb: -60,
      clipping: false,
      currentWpm: 0,
      fillerCount: 0,
      speakingTimeMs: 0,
      segmentCount: 0,
      totalWords: 0,
      latestSegmentText: '',
      webSpeechActive: false,
    },
    environment: null,
  };
}

const MEDIAPIPE_START_DELAY_MS = 10_000;

export function useInterviewAnalysis(options?: UseInterviewAnalysisOptions): UseInterviewAnalysisReturn {
  const videoTelemetrySessionIdRef = useRef<string | null>(options?.videoTelemetrySessionId ?? null);
  const videoTelemetryIntervalMsRef = useRef(
    options?.videoTelemetryIntervalMs ?? VIDEO_TELEMETRY_INTERVAL_MS
  );

  useEffect(() => {
    videoTelemetrySessionIdRef.current = options?.videoTelemetrySessionId ?? null;
  }, [options?.videoTelemetrySessionId]);

  useEffect(() => {
    videoTelemetryIntervalMsRef.current =
      options?.videoTelemetryIntervalMs ?? VIDEO_TELEMETRY_INTERVAL_MS;
  }, [options?.videoTelemetryIntervalMs]);

  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMeasurements, setLiveMeasurements] = useState<LiveMeasurements>(defaultLiveMeasurements);

  const presenceRef = useRef<PresenceAnalyzer | null>(null);
  const speechRef = useRef<SpeechAnalyzer | null>(null);
  const environmentRef = useRef<EnvironmentAnalyzer | null>(null);
  const liveTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const telemetryTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const envReportRef = useRef<EnvironmentReport | null>(null);
  const presenceStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);
  const liveMeasurementsRef = useRef<LiveMeasurements>(defaultLiveMeasurements());
  const analysisStartedAtMsRef = useRef<number>(0);

  const clearTelemetryInterval = useCallback(() => {
    if (telemetryTickRef.current) {
      clearInterval(telemetryTickRef.current);
      telemetryTickRef.current = null;
    }
  }, []);

  const updateLiveStats = useCallback(() => {
    const pa = presenceRef.current;
    const sa = speechRef.current;

    const latestPresenceSnap = pa?.peekLatestSnapshot();
    const presenceMeta = pa?.peekSessionMeta() ?? {
      snapshotCount: 0,
      faceTouchCount: 0,
      hairTouchCount: 0,
    };
    const latestAudioSnap = sa?.peekLatestAudioSnapshot();
    const liveSpeech = sa?.peekLiveSpeechMetrics() ?? { latestText: '', liveWpm: 0 };

    const next: LiveMeasurements = {
      presence: {
        hasSamples: latestPresenceSnap != null,
        gazeDirection: latestPresenceSnap?.gaze?.direction ?? 'unknown',
        gazeConfidence: latestPresenceSnap?.gaze?.confidence ?? 0,
        headYawDeg: latestPresenceSnap?.headYaw ?? 0,
        headPitchDeg: latestPresenceSnap?.headPitch ?? 0,
        headRollDeg: latestPresenceSnap?.headRoll ?? 0,
        spineAngleDeg: latestPresenceSnap?.posture?.spineAngleDeg ?? 0,
        isSlouching: latestPresenceSnap?.posture?.isSlouching ?? false,
        browRaise: latestPresenceSnap?.stress?.browRaise ?? 0,
        lipCompression: latestPresenceSnap?.stress?.lipCompression ?? 0,
        jawTension: latestPresenceSnap?.stress?.jawTension ?? 0,
        overallStress: latestPresenceSnap?.stress?.overallStress ?? 0,
        snapshotCount: presenceMeta.snapshotCount,
        faceTouchCount: presenceMeta.faceTouchCount,
        hairTouchCount: presenceMeta.hairTouchCount,
      },
      speech: {
        rmsDb: latestAudioSnap?.rmsDb ?? 0,
        snrDb: latestAudioSnap?.snrDb ?? 0,
        noiseFloorDb: latestAudioSnap?.noiseFloorDb ?? -60,
        clipping: latestAudioSnap?.clipping ?? false,
        currentWpm: liveSpeech.liveWpm,
        fillerCount: sa?.getTotalFillerCount() ?? 0,
        speakingTimeMs: sa?.getTotalSpeakingTimeMs() ?? 0,
        segmentCount: sa?.getSegmentCount() ?? 0,
        totalWords: sa?.getTotalWordCount() ?? 0,
        latestSegmentText: liveSpeech.latestText,
        webSpeechActive: sa?.isWebSpeechActive() ?? false,
      },
      environment: envReportRef.current,
    };
    liveMeasurementsRef.current = next;
    setLiveMeasurements(next);
  }, []);

  const startAnalysis = useCallback(
    async (videoEl: HTMLVideoElement, stream: MediaStream): Promise<void> => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      setError(null);
      const initialLive = defaultLiveMeasurements();
      liveMeasurementsRef.current = initialLive;
      setLiveMeasurements(initialLive);
      envReportRef.current = null;
      analysisStartedAtMsRef.current = Date.now();

      try {
        const sa = new SpeechAnalyzer();
        await sa.start(stream);
        speechRef.current = sa;

        liveTickRef.current = setInterval(() => {
          updateLiveStats();
        }, 1000);

        clearTelemetryInterval();
        const sid = videoTelemetrySessionIdRef.current?.trim();
        if (sid) {
          const tickMs = videoTelemetryIntervalMsRef.current;
          telemetryTickRef.current = window.setInterval(() => {
            if (!isRunningRef.current) return;
            const sessionId = videoTelemetrySessionIdRef.current?.trim();
            if (!sessionId) return;
            const payload = buildInterviewVideoTelemetrySample(
              liveMeasurementsRef.current,
              analysisStartedAtMsRef.current
            );
            void postVideoTelemetry(sessionId, payload);
          }, tickMs);
        }

        setIsRunning(true);
        setIsReady(true);

        presenceStartTimerRef.current = window.setTimeout(() => {
          presenceStartTimerRef.current = null;
          if (!isRunningRef.current) return;

          void (async () => {
            try {
              if (!presenceRef.current) {
                const pa = new PresenceAnalyzer();
                await pa.init();
                presenceRef.current = pa;
              }
              presenceRef.current.start(videoEl);
              await new Promise((r) => setTimeout(r, 500));
            } catch (e: unknown) {
              setError(
                e instanceof Error
                  ? e.message
                  : 'Failed to initialise MediaPipe. Ensure camera permissions are granted.'
              );
            }

            if (!isRunningRef.current) return;

            const ea = new EnvironmentAnalyzer();
            environmentRef.current = ea;
            void ea
              .analyze(videoEl, stream, {
                getFaceLandmarks: () => presenceRef.current?.peekLatestFaceLandmarks() ?? null,
                getPoseLandmarks: () => presenceRef.current?.peekLatestPoseLandmarks() ?? null,
              })
              .then((report) => {
                if (isRunningRef.current) envReportRef.current = report;
              })
              .catch((err) => {
                console.warn('[useInterviewAnalysis] environment analyze failed', err);
              });
          })();
        }, MEDIAPIPE_START_DELAY_MS);
      } catch (e: unknown) {
        isRunningRef.current = false;
        setIsRunning(false);
        setError(e instanceof Error ? e.message : 'Failed to start analysis');
      }
    },
    [updateLiveStats, clearTelemetryInterval]
  );

  const stopAnalysis = useCallback(async (): Promise<FullAnalysisReport> => {
    if (presenceStartTimerRef.current) {
      clearTimeout(presenceStartTimerRef.current);
      presenceStartTimerRef.current = null;
    }

    if (liveTickRef.current) {
      clearInterval(liveTickRef.current);
      liveTickRef.current = null;
    }

    clearTelemetryInterval();

    const presence = presenceRef.current?.stop() ?? emptyPresenceReport();
    const speech = speechRef.current?.stop() ?? emptySpeechReport();
    const environment = envReportRef.current ?? emptyEnvironmentReport();

    isRunningRef.current = false;
    setIsRunning(false);

    const compositeScore = computeComposite(presence, speech, environment);

    const cleared = defaultLiveMeasurements();
    liveMeasurementsRef.current = cleared;
    setLiveMeasurements(cleared);

    return {
      presence,
      speech,
      environment,
      compositeScore,
      generatedAt: Date.now(),
    };
  }, [clearTelemetryInterval]);

  return { isReady, isRunning, error, liveMeasurements, startAnalysis, stopAnalysis };
}

function computeComposite(
  presence: PresenceReport,
  speech: SpeechReport,
  environment: EnvironmentReport
): number {
  const p = presence.scores.overall;
  const s = speech.scores.overall;
  const e = environment.overallScore;
  return Math.round(p * 0.45 + s * 0.35 + e * 0.2);
}

function emptyPresenceReport(): PresenceReport {
  const scores = { eyeContact: 0, posture: 0, composure: 0, gestures: 0, overall: 0 };
  return {
    sessionDurationMs: 0,
    snapshots: [],
    fidgetEvents: [],
    gaze: { cameraPercent: 0, screenPercent: 0, downPercent: 0, longestDownGapMs: 0, avgConfidence: 0 },
    posture: { uprightPercent: 0, forwardLeanPercent: 0, slouchEvents: 0, avgSpineAngle: 0 },
    stress: { avgBrowRaise: 0, avgLipCompression: 0, stressEvents: 0, stressSpikeTimestamps: [] },
    fidget: { faceTouchCount: 0, hairTouchCount: 0 },
    scores,
  };
}

function emptySpeechReport(): SpeechReport {
  return {
    sessionDurationMs: 0,
    segments: [],
    silenceGaps: [],
    audioQualitySnapshots: [],
    fillerWordCounts: {},
    topFillers: [],
    stats: {
      totalWords: 0,
      speakingTimeMs: 0,
      avgWpm: 0,
      maxWpm: 0,
      minWpm: 0,
      fillersPerMinute: 0,
      deadPauseCount: 0,
      longestSilenceMs: 0,
      avgNoiseFloorDb: -60,
      avgSnrDb: 0,
      transcriptionConfidence: 0,
    },
    scores: { pace: 0, fillerDensity: 0, silenceControl: 0, audioClarity: 0, overall: 0 },
    fullTranscript: '',
  };
}

function emptyEnvironmentReport(): EnvironmentReport {
  return {
    lighting: {
      avgBrightness: 128,
      faceBrightness: 128,
      backgroundBrightness: 128,
      backlightDetected: false,
      contrastRatio: 1,
      colorTemperature: 'unknown',
      score: 50,
      verdict: 'fair',
      issue: null,
    },
    camera: {
      estimatedAngleDeg: 0,
      foreheadYNorm: 0.2,
      chinYNorm: 0.6,
      faceVerticalSpan: 0.4,
      isAboveEyeLevel: false,
      score: 50,
      verdict: 'fair',
      issue: null,
    },
    background: {
      edgeDensity: 0.2,
      motionScore: 0,
      dominantBgColor: null,
      isUniform: true,
      score: 50,
      verdict: 'fair',
      issue: null,
    },
    attire: {
      dominantRgb: [128, 128, 128],
      dominantHsl: [0, 0, 50],
      colorClass: 'unknown',
      colorVariance: 0,
      brightnessValue: 128,
      saturationValue: 0,
      moireRisk: false,
      torsoPixelCount: 0,
      score: 50,
      verdict: 'fair',
      issue: null,
      suggestion: null,
    },
    audio: {
      noiseFloorDb: -45,
      peakDb: -30,
      hasBackgroundNoise: false,
      externalEventCount: 0,
      echoDetected: false,
      spectralFlatness: 0,
      score: 50,
      verdict: 'fair',
      issue: null,
    },
    overallScore: 50,
    criticalIssues: [],
    suggestions: [],
  };
}
