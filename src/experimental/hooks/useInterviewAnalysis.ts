/**
 * Wires PresenceAnalyzer + SpeechAnalyzer + EnvironmentAnalyzer for an interview session.
 * MediaPipe (face + pose) starts after a delay so the camera preview stays responsive.
 *
 * --- Video telemetry / `currInt*` troubleshooting (search console: `[InterviewVideoTelemetry]`) ---
 * - This file: `startAnalysis` early-return (`isRunningRef`), `runTelemetryTicks` (session id or
 *   `exposeTelemetryIntervalDebug`), telemetry `setInterval`, `speechRef` null, segment cursor
 *   `lastVideoTelemetrySegmentIndexRef`, `telemetryWpmSamplesRef` (1s samples → flush on tick),
 *   interim / live-WPM accumulator after `getNewSegmentsSinceIndex`.
 * - `src/experimental/types/SpeechAnalyzer.ts` — `handleSpeechResult` (`isFinal` vs interim),
 *   `peekInterimTelemetrySnapshot`, `segments` / `getSegmentCount`.
 * - `src/utils/videoTelemetryPayload.ts` — `buildInterviewVideoTelemetrySample` (payload shape).
 * - `src/services/interviewService.ts` — `postVideoTelemetry` (network, 401, URL session id).
 * - `src/api/axiosInstance.ts` — `X-Interview-Access-Token` / JWT on `fastApiClient`.
 * - `src/pages/InterviewInterface/index.tsx` — effect that calls `startAnalysis` / `stopAnalysis`
 *   (deps: `streamReady`, `sessionId`, `isComplete`); passes `videoTelemetrySessionId`.
 * - `src/hooks/useMediaDevices.ts` — mic stream passed into `startAnalysis`.
 *
 * Verbose logs: automatic in `import.meta.env.DEV`, or pass `debugVideoTelemetry: true` to this hook
 * (including production builds while debugging).
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

function normalizedTelemetrySessionId(raw: unknown): string {
  if (raw == null) return '';
  return String(raw).trim();
}

export type { LiveMeasurements } from '../types/liveMeasurements';

export interface FullAnalysisReport {
  presence: PresenceReport;
  speech: SpeechReport;
  environment: EnvironmentReport;
  compositeScore: number;
  generatedAt: number;
}

/**
 * One 20s (or custom) telemetry batch — mirrors payload `speech.currInt*` for debugging (TestVideo).
 * `currInt*` prefers new Web Speech finals, else interim, else 1s `currentWpm` samples collected while
 * the mic looks active (`liveWpmAccumulator`).
 */
export interface VideoTelemetryIntervalDebugEntry {
  tickAtMs: number;
  /** Seconds since analysis start (same idea as telemetry payload `duration`). */
  payloadDurationSec: number;
  /** Segment index cursor before this tick (`getNewSegmentsSinceIndex(from)`). */
  fromSegmentIndex: number;
  /** `getSegmentCount()` after advancing the cursor. */
  toSegmentIndexExclusive: number;
  currIntSegmentCounts: number;
  currIntSegmentWpm: number[];
  currIntSegmentWords: number[];
  /** Whether a FastAPI POST was attempted (session id present). */
  postedToApi: boolean;
  /** How this tick filled `currInt*`. */
  currIntSource?: 'finals' | 'interim' | 'liveWpmAccumulator' | 'none';
  /** Seconds of live WPM samples consumed when source is `liveWpmAccumulator`. */
  liveWpmSampleSeconds?: number;
}

export interface UseInterviewAnalysisOptions {
  /** When set, POSTs telemetry to FastAPI on `VIDEO_TELEMETRY_INTERVAL_MS` while analysis runs. */
  videoTelemetrySessionId?: string | null;
  videoTelemetryIntervalMs?: number;
  /**
   * When the interview mic track is disabled, Web Speech must not start; set to false if `audioEnabled` is off.
   * Nudging when this flips to true helps recognition attach after unmute.
   */
  micEnabled?: boolean;
  /**
   * Run the same interval as video telemetry even **without** a session id, and append each batch to
   * `telemetryIntervalDebug`. Use on experimental TestVideo to verify `currIntSegment*` / Web Speech finals.
   */
  exposeTelemetryIntervalDebug?: boolean;
  /** When true (or when `import.meta.env.DEV`), logs `[InterviewVideoTelemetry]` to the console. */
  debugVideoTelemetry?: boolean;
}

export interface UseInterviewAnalysisReturn {
  isReady: boolean;
  isRunning: boolean;
  error: string | null;
  liveMeasurements: LiveMeasurements;
  startAnalysis: (videoEl: HTMLVideoElement, stream: MediaStream) => Promise<void>;
  stopAnalysis: () => Promise<FullAnalysisReport>;
  /** Last N telemetry-interval batches when `exposeTelemetryIntervalDebug` is true; else []. */
  telemetryIntervalDebug: VideoTelemetryIntervalDebugEntry[];
  speechRef: SpeechAnalyzer | null;
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

const MEDIAPIPE_START_DELAY_MS = 20_000;

const TEL = '[InterviewVideoTelemetry]';

function telemetryLoggingEnabled(debugOptIn: boolean): boolean {
  return debugOptIn || import.meta.env.DEV;
}

export function useInterviewAnalysis(options?: UseInterviewAnalysisOptions): UseInterviewAnalysisReturn {
  const videoTelemetrySessionIdRef = useRef<string | null>(
    options?.videoTelemetrySessionId != null ? String(options.videoTelemetrySessionId) : null
  );
  const videoTelemetryIntervalMsRef = useRef(
    options?.videoTelemetryIntervalMs ?? VIDEO_TELEMETRY_INTERVAL_MS
  );

  useEffect(() => {
    const v = options?.videoTelemetrySessionId;
    videoTelemetrySessionIdRef.current = v != null ? String(v) : null;
  }, [options?.videoTelemetrySessionId]);

  useEffect(() => {
    videoTelemetryIntervalMsRef.current =
      options?.videoTelemetryIntervalMs ?? VIDEO_TELEMETRY_INTERVAL_MS;
  }, [options?.videoTelemetryIntervalMs]);

  const micEnabledRef = useRef(options?.micEnabled !== false);
  useEffect(() => {
    micEnabledRef.current = options?.micEnabled !== false;
  }, [options?.micEnabled]);

  const exposeTelemetryDebugRef = useRef(options?.exposeTelemetryIntervalDebug === true);
  useEffect(() => {
    exposeTelemetryDebugRef.current = options?.exposeTelemetryIntervalDebug === true;
  }, [options?.exposeTelemetryIntervalDebug]);

  const debugVideoTelemetryRef = useRef(options?.debugVideoTelemetry === true);
  useEffect(() => {
    debugVideoTelemetryRef.current = options?.debugVideoTelemetry === true;
  }, [options?.debugVideoTelemetry]);

  const [telemetryIntervalDebug, setTelemetryIntervalDebug] = useState<VideoTelemetryIntervalDebugEntry[]>([]);

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
  /** Next segment index to include in video telemetry (finals only; see SpeechAnalyzer.segments order). */
  const lastVideoTelemetrySegmentIndexRef = useRef(0);
  /**
   * One `currentWpm` sample per live tick (1s) while speech looks active. Flushed into `currInt*` on
   * telemetry POST when there are no new finals and no interim snapshot (handles cursor caught up).
   */
  const telemetryWpmSamplesRef = useRef<number[]>([]);

  useEffect(() => {
    if (options?.micEnabled === false) return;
    speechRef.current?.nudgeSpeechRecognition();
  }, [options?.micEnabled]);

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

    if (isRunningRef.current && sa) {
      const hasInterim = sa.peekInterimTelemetrySnapshot() != null;
      const likelySpeaking =
        next.speech.webSpeechActive ||
        hasInterim ||
        (next.speech.currentWpm >= 2 && next.speech.rmsDb > -53);
      if (likelySpeaking) {
        const buf = telemetryWpmSamplesRef.current;
        buf.push(Math.min(240, Math.max(0, next.speech.currentWpm)));
        if (buf.length > 600) telemetryWpmSamplesRef.current = buf.slice(-400);
      }
    }

    setLiveMeasurements(next);
  }, []);

  const startAnalysis = useCallback(
    async (videoEl: HTMLVideoElement, stream: MediaStream): Promise<void> => {
      if (isRunningRef.current) {
        if (telemetryLoggingEnabled(debugVideoTelemetryRef.current)) {
          console.warn(TEL, 'startAnalysis skipped — already running (check stop/start race or double invoke)');
        }
        return;
      }
      isRunningRef.current = true;
      setError(null);
      const initialLive = defaultLiveMeasurements();
      liveMeasurementsRef.current = initialLive;
      setLiveMeasurements(initialLive);
      envReportRef.current = null;
      analysisStartedAtMsRef.current = Date.now();
      lastVideoTelemetrySegmentIndexRef.current = 0;
      telemetryWpmSamplesRef.current = [];
      setTelemetryIntervalDebug([]);

      try {
        const sa = new SpeechAnalyzer();
        await sa.start(stream);
        // const audioTracks = stream.getAudioTracks();
        // console.log('[SpeechAnalyzer stream check]', {
        //   trackCount: audioTracks.length,
        //   trackEnabled: audioTracks[0]?.enabled,
        //   trackMuted: audioTracks[0]?.muted,
        //   trackReadyState: audioTracks[0]?.readyState,
        //   trackLabel: audioTracks[0]?.label,
        // });
        speechRef.current = sa;
        if (micEnabledRef.current) {
          sa.nudgeSpeechRecognition();
        }

        liveTickRef.current = setInterval(() => {
          updateLiveStats();
        }, 1000);

        clearTelemetryInterval();
        const sid = normalizedTelemetrySessionId(videoTelemetrySessionIdRef.current);
        const tickMs = videoTelemetryIntervalMsRef.current;
        const runTelemetryTicks = Boolean(sid) || exposeTelemetryDebugRef.current;
        if (telemetryLoggingEnabled(debugVideoTelemetryRef.current)) {
          if (runTelemetryTicks) {
            console.warn(TEL, 'telemetry interval armed', {
              tickMs,
              hasSessionId: Boolean(sid),
              sessionIdLen: sid.length,
              exposeTelemetryIntervalDebug: exposeTelemetryDebugRef.current,
            });
          } else {
            console.warn(
              TEL,
              'telemetry interval NOT armed — no normalized session id and exposeTelemetryIntervalDebug is false; currInt POSTs will never run'
            );
          }
        }
        if (runTelemetryTicks) {
          telemetryTickRef.current = window.setInterval(() => {
            if (!isRunningRef.current) return;
            const sessionId = normalizedTelemetrySessionId(videoTelemetrySessionIdRef.current);
            const sa = speechRef.current;
            const fromIdx = lastVideoTelemetrySegmentIndexRef.current;
            const intervalSegs = sa?.getNewSegmentsSinceIndex(fromIdx) ?? [];
            const toIdx = sa?.getSegmentCount() ?? fromIdx;
            lastVideoTelemetrySegmentIndexRef.current = toIdx;

            let currIntSegmentCounts = intervalSegs.length;
            let currIntSegmentWpm = intervalSegs.map((s) => s.wpm);
            let currIntSegmentWords = intervalSegs.map((s) => s.wordCount);
            let currIntSource: VideoTelemetryIntervalDebugEntry['currIntSource'] =
              intervalSegs.length > 0 ? 'finals' : 'none';
            let liveWpmSampleSeconds: number | undefined;

            if (intervalSegs.length > 0) {
              telemetryWpmSamplesRef.current = [];
            }

            if (currIntSegmentCounts === 0 && sa) {
              const interim = sa.peekInterimTelemetrySnapshot();
              if (interim) {
                currIntSource = 'interim';
                currIntSegmentCounts = 1;
                currIntSegmentWpm = [interim.wpm];
                currIntSegmentWords = [interim.wordCount];
                telemetryWpmSamplesRef.current = [];
              }
            }

            if (currIntSegmentCounts === 0) {
              const samples = telemetryWpmSamplesRef.current;
              if (samples.length > 0) {
                telemetryWpmSamplesRef.current = [];
                currIntSource = 'liveWpmAccumulator';
                liveWpmSampleSeconds = samples.length;
                const sumWpm = samples.reduce((a, w) => a + w, 0);
                const avgWpm = Math.round(sumWpm / samples.length);
                const estWords = Math.max(1, Math.round(samples.reduce((a, w) => a + w / 60, 0)));
                currIntSegmentCounts = 1;
                currIntSegmentWpm = [avgWpm];
                currIntSegmentWords = [estWords];
              }
            }

            if (telemetryLoggingEnabled(debugVideoTelemetryRef.current)) {
              const live = liveMeasurementsRef.current.speech;
              console.warn(TEL, 'tick', {
                durationSec: Math.max(0, Math.round((Date.now() - analysisStartedAtMsRef.current) / 1000)),
                willPost: Boolean(sessionId),
                speechRefNull: !sa,
                segmentCursor: { from: fromIdx, toExclusive: toIdx },
                finalsInBatch: intervalSegs.length,
                currIntSource,
                liveWpmSampleSeconds,
                wpmSamplesBufferedAfterTick: telemetryWpmSamplesRef.current.length,
                currInt: {
                  counts: currIntSegmentCounts,
                  wpm: currIntSegmentWpm,
                  words: currIntSegmentWords,
                },
                liveSpeechSnapshot: {
                  segmentCount: live.segmentCount,
                  totalWords: live.totalWords,
                  currentWpm: live.currentWpm,
                  webSpeechActive: live.webSpeechActive,
                  latestSnippet: live.latestSegmentText?.slice(0, 100),
                },
              });
            }

            if (exposeTelemetryDebugRef.current) {
              const entry: VideoTelemetryIntervalDebugEntry = {
                tickAtMs: Date.now(),
                payloadDurationSec: Math.max(
                  0,
                  Math.round((Date.now() - analysisStartedAtMsRef.current) / 1000)
                ),
                fromSegmentIndex: fromIdx,
                toSegmentIndexExclusive: toIdx,
                currIntSegmentCounts,
                currIntSegmentWpm,
                currIntSegmentWords,
                postedToApi: Boolean(sessionId),
                currIntSource,
                liveWpmSampleSeconds,
              };
              setTelemetryIntervalDebug((prev) => [...prev.slice(-49), entry]);
            }

            if (sessionId) {
              const payload = buildInterviewVideoTelemetrySample(
                liveMeasurementsRef.current,
                analysisStartedAtMsRef.current
              );
              payload.speech = {
                ...payload.speech,
                currIntSegmentCounts,
                currIntSegmentWpm,
                currIntSegmentWords,
              };
              void postVideoTelemetry(sessionId, payload, telemetryLoggingEnabled(debugVideoTelemetryRef.current));
            }
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

              if (isRunningRef.current && speechRef.current) {
                console.log('[useInterviewAnalysis] nudging Web Speech after MediaPipe init');
                speechRef.current.forceRestartRecognition();
              }

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
        telemetryWpmSamplesRef.current = [];
        setIsRunning(false);
        setError(e instanceof Error ? e.message : 'Failed to start analysis');
      }
    },
    [updateLiveStats, clearTelemetryInterval]
  );

  const stopAnalysis = useCallback(async (): Promise<FullAnalysisReport> => {
    if (telemetryLoggingEnabled(debugVideoTelemetryRef.current)) {
      console.warn(TEL, 'stopAnalysis — clearing timers and stopping analyzers');
    }

    if (presenceStartTimerRef.current) {
      clearTimeout(presenceStartTimerRef.current);
      presenceStartTimerRef.current = null;
    }

    if (liveTickRef.current) {
      clearInterval(liveTickRef.current);
      liveTickRef.current = null;
    }

    clearTelemetryInterval();

    const presenceInst = presenceRef.current;
    const speechInst = speechRef.current;
    presenceRef.current = null;
    speechRef.current = null;
    isRunningRef.current = false;
    setIsRunning(false);

    const presence = presenceInst?.stop() ?? emptyPresenceReport();
    const speech = speechInst?.stop() ?? emptySpeechReport();
    const environment = envReportRef.current ?? emptyEnvironmentReport();

    const compositeScore = computeComposite(presence, speech, environment);

    const cleared = defaultLiveMeasurements();
    liveMeasurementsRef.current = cleared;
    setLiveMeasurements(cleared);
    setTelemetryIntervalDebug([]);
    telemetryWpmSamplesRef.current = [];

    return {
      presence,
      speech,
      environment,
      compositeScore,
      generatedAt: Date.now(),
    };
  }, [clearTelemetryInterval]);

  return {
    isReady,
    isRunning,
    error,
    liveMeasurements,
    startAnalysis,
    stopAnalysis,
    telemetryIntervalDebug,
    speechRef: speechRef.current
  };
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
