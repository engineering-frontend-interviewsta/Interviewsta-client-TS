/**
 * presenceAnalyzer.ts
 *
 * Runs entirely in the browser. Uses MediaPipe Face Mesh (468 landmarks) and
 * Pose (33 landmarks) on each video frame to extract:
 *   - Eye contact / gaze direction
 *   - Head pose (pitch, yaw, roll)
 *   - Posture (spine angle via shoulder/hip landmarks)
 *   - Facial expression stress markers (brow raise, lip compression)
 *   - Fidget / hand-to-face events
 *
 * Call `start(videoElement)` when the interview begins.
 * Call `stop()` to get the final PresenceReport.
 *
 * Uses `@mediapipe/face_mesh` and `@mediapipe/pose` (bundled). WASM/data files load via `locateFile` (CDN).
 */

import { FaceMesh } from '@mediapipe/face_mesh';
import { Pose } from '@mediapipe/pose';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GazeEvent {
    timestamp: number;       // ms from session start
    direction: "camera" | "screen" | "down" | "away";
    confidence: number;      // 0–1
  }
  
  export interface PostureEvent {
    timestamp: number;
    spineAngleDeg: number;   // 0 = upright, negative = forward lean, positive = slouch
    isSlouching: boolean;    // spineAngleDeg > SLOUCH_THRESHOLD
  }
  
  export interface StressMarkerEvent {
    timestamp: number;
    browRaise: number;       // 0–1, computed from landmark distances
    lipCompression: number;  // 0–1
    jawTension: number;      // 0–1
    overallStress: number;   // weighted composite
  }
  
  export interface FidgetEvent {
    timestamp: number;
    type: "face_touch" | "hair_touch" | "hand_visible" | "rocking";
  }
  
  export interface PresenceSnapshot {
    timestamp: number;
    gaze: GazeEvent;
    posture: PostureEvent;
    stress: StressMarkerEvent;
    headYaw: number;         // degrees left/right
    headPitch: number;       // degrees up/down
    headRoll: number;        // degrees tilt
  }
  
  export interface PresenceReport {
    sessionDurationMs: number;
    snapshots: PresenceSnapshot[];        // one per analysed frame (sampled at ~2 fps)
    fidgetEvents: FidgetEvent[];
  
    // Aggregated — these are what get sent to the backend and shown in the report
    gaze: {
      cameraPercent: number;
      screenPercent: number;
      downPercent: number;
      longestDownGapMs: number;
      avgConfidence: number;
    };
    posture: {
      uprightPercent: number;
      forwardLeanPercent: number;
      slouchEvents: number;
      avgSpineAngle: number;
    };
    stress: {
      avgBrowRaise: number;
      avgLipCompression: number;
      stressEvents: number;               // frames where overallStress > 0.6
      stressSpikeTimestamps: number[];
    };
    fidget: {
      faceTouchCount: number;
      hairTouchCount: number;
    };
  
    scores: {
      eyeContact: number;    // 0–100
      posture: number;       // 0–100
      composure: number;     // 0–100
      gestures: number;      // 0–100
      overall: number;       // weighted average
    };
  }
  
  // ─── Constants ────────────────────────────────────────────────────────────────
  
  const SAMPLE_INTERVAL_MS = 500;       // analyse every 500 ms (2 fps)
  const SLOUCH_THRESHOLD_DEG = 15;      // spine deviation from vertical
  const STRESS_THRESHOLD = 0.6;
  const GAZE_YAW_SCREEN_THRESHOLD = 12; // degrees off-camera = "looking at screen"
  const GAZE_PITCH_DOWN_THRESHOLD = 18; // degrees down = "looking down"
  
  // MediaPipe Face Mesh landmark indices (subset)
  const LM = {
    // Iris centres (refined landmarks, index 468–471)
    LEFT_IRIS_CENTER: 468,
    RIGHT_IRIS_CENTER: 473,
    // Eye corners
    LEFT_EYE_INNER: 133,
    LEFT_EYE_OUTER: 33,
    RIGHT_EYE_INNER: 362,
    RIGHT_EYE_OUTER: 263,
    // Brow
    LEFT_BROW_UPPER: 105,
    LEFT_BROW_LOWER: 52,
    RIGHT_BROW_UPPER: 334,
    RIGHT_BROW_LOWER: 282,
    // Lips
    LIP_TOP: 13,
    LIP_BOTTOM: 14,
    LIP_LEFT: 61,
    LIP_RIGHT: 291,
    // Nose tip and chin — used for head pose
    NOSE_TIP: 1,
    CHIN: 152,
    LEFT_TEMPLE: 234,
    RIGHT_TEMPLE: 454,
    // Jaw
    JAW_LEFT: 172,
    JAW_RIGHT: 397,
  };
  
  // MediaPipe Pose landmark indices
  const POSE = {
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_EAR: 7,
    RIGHT_EAR: 8,
    NOSE: 0,
  };
  
  // ─── PresenceAnalyzer class ────────────────────────────────────────────────────
  
  export class PresenceAnalyzer {
    private faceMesh: any = null;
    private pose: any = null;
    private videoEl: HTMLVideoElement | null = null;
    private canvasEl: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
  
    private startTime = 0;
    private lastSampleTime = 0;
    private running = false;
    private animFrameId = 0;
  
    private snapshots: PresenceSnapshot[] = [];
    private fidgetEvents: FidgetEvent[] = [];
  
    // Latest results from MediaPipe callbacks
    private latestFaceLandmarks: any[] | null = null;
    private latestPoseLandmarks: any[] | null = null;
  
    constructor() {
      this.canvasEl = document.createElement("canvas");
      this.ctx = this.canvasEl.getContext("2d")!;
    }
  
    // ── Init ──────────────────────────────────────────────────────────────────
  
    async init(): Promise<void> {
      // Face Mesh — with iris refinement enabled for gaze
      this.faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,      // enables iris tracking (landmarks 468–477)
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      this.faceMesh.onResults((r: any) => {
        this.latestFaceLandmarks =
          r.multiFaceLandmarks?.[0] ?? null;
      });
      await this.faceMesh.initialize();
  
      // Pose
      this.pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      this.pose.onResults((r: any) => {
        this.latestPoseLandmarks = r.poseLandmarks ?? null;
      });
      await this.pose.initialize();
    }
  
    // ── Start / Stop ──────────────────────────────────────────────────────────
  
    start(videoEl: HTMLVideoElement): void {
      if (this.running) return;
      this.videoEl = videoEl;
      this.startTime = performance.now();
      this.running = true;
      this.loop();
    }
  
    stop(): PresenceReport {
      this.running = false;
      cancelAnimationFrame(this.animFrameId);
      return this.buildReport();
    }

    /** Latest frame sample for live UI (don’t read private `snapshots` from outside — minifiers may rename it). */
    peekLatestSnapshot(): PresenceSnapshot | undefined {
      const n = this.snapshots.length;
      return n > 0 ? this.snapshots[n - 1] : undefined;
    }

    /** Live dashboard: sample count + fidget tallies (session so far). */
    peekSessionMeta(): { snapshotCount: number; faceTouchCount: number; hairTouchCount: number } {
      let faceTouchCount = 0;
      let hairTouchCount = 0;
      for (const e of this.fidgetEvents) {
        if (e.type === 'face_touch') faceTouchCount++;
        if (e.type === 'hair_touch') hairTouchCount++;
      }
      return {
        snapshotCount: this.snapshots.length,
        faceTouchCount,
        hairTouchCount,
      };
    }

    /** Latest face mesh landmarks for `EnvironmentAnalyzer` (same ref MediaPipe writes). */
    peekLatestFaceLandmarks(): any[] | null {
      return this.latestFaceLandmarks;
    }

    /** Latest pose landmarks for environment / attire sampling. */
    peekLatestPoseLandmarks(): any[] | null {
      return this.latestPoseLandmarks;
    }
  
    // ── Main loop ─────────────────────────────────────────────────────────────
  
    private loop = (): void => {
      if (!this.running) return;
      this.animFrameId = requestAnimationFrame(this.loop);
  
      const now = performance.now();
      if (now - this.lastSampleTime < SAMPLE_INTERVAL_MS) return;
      this.lastSampleTime = now;
  
      this.sendFrameToMediaPipe();
      this.processSample(now - this.startTime);
    };
  
    private sendFrameToMediaPipe(): void {
      if (!this.videoEl) return;
      const { videoWidth: w, videoHeight: h } = this.videoEl;
      if (!w || !h) return;
  
      this.canvasEl.width = w;
      this.canvasEl.height = h;
      this.ctx.drawImage(this.videoEl, 0, 0, w, h);
  
      // Fire-and-forget; results arrive in the onResults callbacks
      this.faceMesh?.send({ image: this.canvasEl }).catch(() => {});
      this.pose?.send({ image: this.canvasEl }).catch(() => {});
    }
  
    // ── Per-frame processing ──────────────────────────────────────────────────
  
    private processSample(elapsedMs: number): void {
      const face = this.latestFaceLandmarks;
      const poseLM = this.latestPoseLandmarks;
  
      const gaze = face ? this.computeGaze(face) : this.unknownGaze(elapsedMs);
      const posture = poseLM
        ? this.computePosture(poseLM, elapsedMs)
        : this.unknownPosture(elapsedMs);
      const stress = face
        ? this.computeStress(face, elapsedMs)
        : this.unknownStress(elapsedMs);
      const headAngles = face
        ? this.computeHeadAngles(face)
        : { yaw: 0, pitch: 0, roll: 0 };
  
      // Fidget detection from pose
      if (poseLM) this.detectFidget(poseLM, face, elapsedMs);
  
      this.snapshots.push({
        timestamp: elapsedMs,
        gaze,
        posture,
        stress,
        headYaw: headAngles.yaw,
        headPitch: headAngles.pitch,
        headRoll: headAngles.roll,
      });
    }
  
    // ── Gaze estimation ───────────────────────────────────────────────────────
    //
    // We use the iris centre position relative to the eye corners.
    // A normalised offset from eye-centre gives horizontal and vertical gaze.
    // Combined with head pose yaw/pitch for the final direction label.
  
    private computeGaze(face: any[]): GazeEvent {
      const get = (i: number) => face[i] ?? { x: 0, y: 0, z: 0 };
  
      // Iris positions (refined landmarks)
      const li = get(LM.LEFT_IRIS_CENTER);
      const ri = get(LM.RIGHT_IRIS_CENTER);
  
      // Eye corner anchors
      const le_in  = get(LM.LEFT_EYE_INNER);
      const le_out = get(LM.LEFT_EYE_OUTER);
      const re_in  = get(LM.RIGHT_EYE_INNER);
      const re_out = get(LM.RIGHT_EYE_OUTER);
  
      // Horizontal gaze offset: 0 = far-left, 0.5 = centre, 1 = far-right
      const leftGazeH  = (li.x - le_out.x) / (le_in.x  - le_out.x + 0.0001);
      const rightGazeH = (ri.x - re_out.x) / (re_in.x - re_out.x + 0.0001);
      const gazeH = (leftGazeH + rightGazeH) / 2; // 0–1, 0.5 = looking forward
  
      // Vertical: iris y relative to eye height
      const leftGazeV  = (li.y - le_in.y)  / (Math.abs(le_in.y  - le_out.y)  + 0.0001);
      const rightGazeV = (ri.y - re_in.y) / (Math.abs(re_in.y - re_out.y) + 0.0001);
      void ((leftGazeV + rightGazeV) / 2); // vertical gaze component (reserved)

      // Head yaw from nose + chin vector
      const { yaw, pitch } = this.computeHeadAngles(face);
  
      let direction: GazeEvent["direction"];
      if (pitch > GAZE_PITCH_DOWN_THRESHOLD) {
        direction = "down";
      } else if (Math.abs(yaw) < GAZE_YAW_SCREEN_THRESHOLD && Math.abs(gazeH - 0.5) < 0.15) {
        direction = "camera";
      } else if (Math.abs(yaw) < 30) {
        direction = "screen"; // looking at monitor area
      } else {
        direction = "away";
      }
  
      const confidence = Math.min(1, 1 - Math.abs(gazeH - 0.5) * 0.5);
      return { timestamp: 0, direction, confidence };
    }
  
    // ── Head angles via solvePnP-lite (2D→3D projection approximation) ────────
    //
    // We use 4 stable landmarks to estimate yaw and pitch without a full 3D model.
  
    private computeHeadAngles(face: any[]): { yaw: number; pitch: number; roll: number } {
      const get = (i: number) => face[i] ?? { x: 0.5, y: 0.5 };
      const nose    = get(LM.NOSE_TIP);
      const chin    = get(LM.CHIN);
      const leftT   = get(LM.LEFT_TEMPLE);
      const rightT  = get(LM.RIGHT_TEMPLE);
  
      // Roll = angle of temple-to-temple line vs horizontal
      const roll = Math.atan2(rightT.y - leftT.y, rightT.x - leftT.x) * (180 / Math.PI);
  
      // Yaw estimate: asymmetry between nose-to-left-temple and nose-to-right-temple
      const leftDist  = Math.hypot(nose.x - leftT.x,  nose.y - leftT.y);
      const rightDist = Math.hypot(nose.x - rightT.x, nose.y - rightT.y);
      // When looking left, left distance shrinks; right expands
      const yaw = ((rightDist - leftDist) / (leftDist + rightDist + 0.0001)) * 90;
  
      // Pitch estimate: vertical position of nose relative to chin-to-temple midpoint
      const eyeMidY = (leftT.y + rightT.y) / 2;
      const faceHeight = Math.abs(chin.y - eyeMidY) + 0.0001;
      const noseRelY = (nose.y - eyeMidY) / faceHeight; // 0 = at eye level, 1 = at chin
      const pitch = (noseRelY - 0.45) * 90; // calibrated: neutral ≈ 0.45
  
      return { yaw, pitch, roll };
    }
  
    // ── Posture via shoulder/hip midpoints ────────────────────────────────────
  
    private computePosture(poseLM: any[], elapsedMs: number): PostureEvent {
      const get = (i: number) => poseLM[i] ?? { x: 0.5, y: 0.5, visibility: 0 };
  
      const ls = get(POSE.LEFT_SHOULDER);
      const rs = get(POSE.RIGHT_SHOULDER);
      const lh = get(POSE.LEFT_HIP);
      const rh = get(POSE.RIGHT_HIP);
  
      const shoulderMidX = (ls.x + rs.x) / 2;
      const shoulderMidY = (ls.y + rs.y) / 2;
      const hipMidX = (lh.x + rh.x) / 2;
      const hipMidY = (lh.y + rh.y) / 2;
  
      // Spine angle relative to vertical (0 = perfect upright)
      const dx = shoulderMidX - hipMidX;
      const dy = shoulderMidY - hipMidY;
      // atan2 gives angle from positive-x axis; subtract 90° to measure from vertical
      const spineAngleDeg = Math.atan2(dx, -dy) * (180 / Math.PI);
      // Positive = leaning forward (toward camera), negative = leaning back
  
      const isSlouching = Math.abs(spineAngleDeg) > SLOUCH_THRESHOLD_DEG &&
                          spineAngleDeg > 0; // slouching = positive (hunching forward/down)
  
      return { timestamp: elapsedMs, spineAngleDeg, isSlouching };
    }
  
    // ── Stress markers via facial geometry ───────────────────────────────────
  
    private computeStress(face: any[], elapsedMs: number): StressMarkerEvent {
      const get = (i: number) => face[i] ?? { x: 0.5, y: 0.5 };
  
      // Brow raise: distance from brow-upper to brow-lower relative to face size
      const lbTop = get(LM.LEFT_BROW_UPPER);
      const lbBot = get(LM.LEFT_BROW_LOWER);
      const rbTop = get(LM.RIGHT_BROW_UPPER);
      const rbBot = get(LM.RIGHT_BROW_LOWER);
  
      const faceRef = Math.abs(get(LM.CHIN).y - lbTop.y) + 0.0001;
      const leftBrowGap  = Math.abs(lbTop.y - lbBot.y) / faceRef;
      const rightBrowGap = Math.abs(rbTop.y - rbBot.y) / faceRef;
      // Normalize: 0.04 = neutral, 0.07 = raised (stress/surprise)
      const browRaise = Math.min(1, Math.max(0, ((leftBrowGap + rightBrowGap) / 2 - 0.03) / 0.05));
  
      // Lip compression: ratio of lip height to width
      const lipTop = get(LM.LIP_TOP);
      const lipBot = get(LM.LIP_BOTTOM);
      const lipLeft = get(LM.LIP_LEFT);
      const lipRight = get(LM.LIP_RIGHT);
      const lipHeight = Math.abs(lipBot.y - lipTop.y);
      const lipWidth  = Math.abs(lipRight.x - lipLeft.x) + 0.0001;
      const lipRatio  = lipHeight / lipWidth;
      // Compressed lips: ratio < 0.15; normal open mouth ≈ 0.25
      const lipCompression = Math.min(1, Math.max(0, (0.2 - lipRatio) / 0.2));
  
      // Jaw tension: width of jaw relative to temple width
      const jawLeft  = get(LM.JAW_LEFT);
      const jawRight = get(LM.JAW_RIGHT);
      const leftT    = get(LM.LEFT_TEMPLE);
      const rightT   = get(LM.RIGHT_TEMPLE);
      const jawWidth    = Math.abs(jawRight.x - jawLeft.x);
      const templeWidth = Math.abs(rightT.x  - leftT.x) + 0.0001;
      const jawRatio = jawWidth / templeWidth;
      // Clenched jaw: ratio increases; neutral ≈ 0.85
      const jawTension = Math.min(1, Math.max(0, (jawRatio - 0.80) / 0.15));
  
      const overallStress = browRaise * 0.4 + lipCompression * 0.35 + jawTension * 0.25;
  
      return { timestamp: elapsedMs, browRaise, lipCompression, jawTension, overallStress };
    }
  
    // ── Fidget detection ──────────────────────────────────────────────────────
  
    private detectFidget(poseLM: any[], _face: any[] | null, elapsedMs: number): void {
      const get = (i: number) => poseLM[i] ?? { x: 0.5, y: 0.5, visibility: 0 };
      const lw = get(POSE.LEFT_WRIST);
      const rw = get(POSE.RIGHT_WRIST);
      const ls = get(POSE.LEFT_SHOULDER);
      const rs = get(POSE.RIGHT_SHOULDER);
      const nose = get(POSE.NOSE);
  
      // Face touch: wrist y-position above shoulder level and near face x-range
      const faceXMin = Math.min(ls.x, rs.x) - 0.1;
      const faceXMax = Math.max(ls.x, rs.x) + 0.1;
      const shoulderY = (ls.y + rs.y) / 2;
  
      const leftNearFace  = lw.visibility > 0.5 && lw.y < shoulderY && lw.x > faceXMin && lw.x < faceXMax;
      const rightNearFace = rw.visibility > 0.5 && rw.y < shoulderY && rw.x > faceXMin && rw.x < faceXMax;
  
      if (leftNearFace || rightNearFace) {
        // Hair touch: wrist above nose level
        const noseY = nose.y;
        if ((leftNearFace && lw.y < noseY) || (rightNearFace && rw.y < noseY)) {
          this.fidgetEvents.push({ timestamp: elapsedMs, type: "hair_touch" });
        } else {
          this.fidgetEvents.push({ timestamp: elapsedMs, type: "face_touch" });
        }
      }
  
      // Rocking: detect rapid lateral oscillation of shoulder midpoint
      // (simplified: check if shoulder midX changes > threshold between frames)
      // This would need a rolling window; placeholder for now
    }
  
    // ── Unknowns (face/pose not detected) ────────────────────────────────────
  
    private unknownGaze(t: number): GazeEvent {
      return { timestamp: t, direction: "away", confidence: 0 };
    }
    private unknownPosture(t: number): PostureEvent {
      return { timestamp: t, spineAngleDeg: 0, isSlouching: false };
    }
    private unknownStress(t: number): StressMarkerEvent {
      return { timestamp: t, browRaise: 0, lipCompression: 0, jawTension: 0, overallStress: 0 };
    }
  
    // ── Report aggregation ────────────────────────────────────────────────────
  
    private buildReport(): PresenceReport {
      const sessionDurationMs = performance.now() - this.startTime;
      const n = this.snapshots.length || 1;
  
      // Gaze
      const gazeByDir = { camera: 0, screen: 0, down: 0, away: 0 };
      let longestDown = 0, currentDown = 0;
      for (const s of this.snapshots) {
        gazeByDir[s.gaze.direction]++;
        if (s.gaze.direction === "down") {
          currentDown += SAMPLE_INTERVAL_MS;
          longestDown = Math.max(longestDown, currentDown);
        } else {
          currentDown = 0;
        }
      }
      const avgGazeConf = this.snapshots.reduce((a, s) => a + s.gaze.confidence, 0) / n;
  
      // Posture
      const uprightCount  = this.snapshots.filter(s => !s.posture.isSlouching && s.posture.spineAngleDeg > -SLOUCH_THRESHOLD_DEG).length;
      const leanCount     = this.snapshots.filter(s => s.posture.spineAngleDeg < -5).length;
      const slouchEvents  = this.countEvents(this.snapshots.map(s => s.posture.isSlouching), 3);
      const avgSpine      = this.snapshots.reduce((a, s) => a + s.posture.spineAngleDeg, 0) / n;
  
      // Stress
      const avgBrow    = this.snapshots.reduce((a, s) => a + s.stress.browRaise, 0) / n;
      const avgLip     = this.snapshots.reduce((a, s) => a + s.stress.lipCompression, 0) / n;
      const stressSnaps = this.snapshots.filter(s => s.stress.overallStress > STRESS_THRESHOLD);
      const stressSpikeTs = stressSnaps.map(s => s.timestamp);
  
      // Fidget counts (deduplicate rapid consecutive events, min 3s apart)
      const dedupedFidgets = this.dedupEvents(this.fidgetEvents, 3000);
      const faceTouches = dedupedFidgets.filter(e => e.type === "face_touch").length;
      const hairTouches = dedupedFidgets.filter(e => e.type === "hair_touch").length;
  
      // Scores
      const eyeContact  = this.scoreGaze(gazeByDir.camera / n, longestDown);
      const postureScore = this.scorePosture(uprightCount / n, slouchEvents);
      const composure   = this.scoreComposure(stressSnaps.length / n, avgBrow, avgLip);
      const gestures    = this.scoreGestures(faceTouches, hairTouches, n);
      const overall     = eyeContact * 0.35 + postureScore * 0.25 + composure * 0.25 + gestures * 0.15;
  
      return {
        sessionDurationMs,
        snapshots: this.snapshots,
        fidgetEvents: dedupedFidgets,
        gaze: {
          cameraPercent:  Math.round(gazeByDir.camera / n * 100),
          screenPercent:  Math.round(gazeByDir.screen / n * 100),
          downPercent:    Math.round(gazeByDir.down   / n * 100),
          longestDownGapMs: longestDown,
          avgConfidence:  avgGazeConf,
        },
        posture: {
          uprightPercent:    Math.round(uprightCount / n * 100),
          forwardLeanPercent: Math.round(leanCount / n * 100),
          slouchEvents,
          avgSpineAngle: Math.round(avgSpine * 10) / 10,
        },
        stress: {
          avgBrowRaise:        Math.round(avgBrow * 100) / 100,
          avgLipCompression:   Math.round(avgLip  * 100) / 100,
          stressEvents:        stressSnaps.length,
          stressSpikeTimestamps: stressSpikeTs,
        },
        fidget: { faceTouchCount: faceTouches, hairTouchCount: hairTouches },
        scores: {
          eyeContact:  Math.round(eyeContact),
          posture:     Math.round(postureScore),
          composure:   Math.round(composure),
          gestures:    Math.round(gestures),
          overall:     Math.round(overall),
        },
      };
    }
  
    // ── Scoring functions ─────────────────────────────────────────────────────
  
    private scoreGaze(cameraFraction: number, longestDownMs: number): number {
      let s = cameraFraction * 100;                          // base: % of time on camera
      if (longestDownMs > 30_000) s -= 20;                   // -20 for >30s continuous drop
      else if (longestDownMs > 15_000) s -= 10;
      return Math.max(0, Math.min(100, s));
    }
  
    private scorePosture(uprightFraction: number, slouchEvents: number): number {
      let s = uprightFraction * 100;
      s -= slouchEvents * 4;                                 // -4 per slouch event
      return Math.max(0, Math.min(100, s));
    }
  
    private scoreComposure(stressFraction: number, avgBrow: number, avgLip: number): number {
      const stressPenalty = stressFraction * 60;             // up to -60 for constant stress
      const browPenalty   = avgBrow * 20;
      const lipPenalty    = avgLip  * 20;
      return Math.max(0, 100 - stressPenalty - browPenalty - lipPenalty);
    }
  
    private scoreGestures(faceTouch: number, hairTouch: number, frames: number): number {
      const rate = (faceTouch + hairTouch * 1.5) / (frames * SAMPLE_INTERVAL_MS / 60_000); // per minute
      if (rate < 1)  return 90;
      if (rate < 3)  return 75;
      if (rate < 6)  return 55;
      return 35;
    }
  
    // ── Utilities ─────────────────────────────────────────────────────────────
  
    /** Count distinct runs of `true` values that last at least minLength frames */
    private countEvents(bools: boolean[], minLength: number): number {
      let count = 0, run = 0;
      for (const b of bools) {
        if (b) { run++; }
        else {
          if (run >= minLength) count++;
          run = 0;
        }
      }
      if (run >= minLength) count++;
      return count;
    }
  
    /** Remove events that are closer than minGapMs to the previous event */
    private dedupEvents<T extends { timestamp: number }>(events: T[], minGapMs: number): T[] {
      const out: T[] = [];
      let last = -Infinity;
      for (const e of events) {
        if (e.timestamp - last >= minGapMs) {
          out.push(e);
          last = e.timestamp;
        }
      }
      return out;
    }
  }