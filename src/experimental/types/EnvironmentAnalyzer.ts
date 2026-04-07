/**
 * Environment analysis (v2): lighting, camera angle, background, attire, room audio.
 * Uses live MediaPipe face/pose landmarks via getters so samples see fresh data.
 *
 *   await ea.analyze(videoEl, stream, {
 *     getFaceLandmarks: () => presence.peekLatestFaceLandmarks(),
 *     getPoseLandmarks: () => presence.peekLatestPoseLandmarks(),
 *   });
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LightingReport {
  avgBrightness:        number;   // 0–255 whole-frame
  faceBrightness:       number;   // 0–255 landmark-bounded face region
  backgroundBrightness: number;   // 0–255 region outside face bbox
  backlightDetected:    boolean;  // background significantly brighter than face
  contrastRatio:        number;   // bg/face luminance ratio
  colorTemperature:     "warm" | "neutral" | "cool" | "unknown";
  score:                number;   // 0–100
  verdict:              "good" | "fair" | "poor";
  issue:                string | null;
}

export interface CameraReport {
  estimatedAngleDeg:  number;   // + = camera below eye level (bad), – = above
  foreheadYNorm:      number;   // 0–1 normalised y of landmark 10
  chinYNorm:          number;   // 0–1 normalised y of landmark 152
  faceVerticalSpan:   number;   // fraction of frame height the face occupies
  isAboveEyeLevel:    boolean;
  score:              number;
  verdict:            "good" | "fair" | "poor";
  issue:              string | null;
}

export interface BackgroundReport {
  edgeDensity:      number;               // 0–1 Sobel proxy on background mask
  motionScore:      number;               // 0–1 inter-frame MAD outside person
  dominantBgColor:  [number,number,number] | null; // avg RGB of background region
  isUniform:        boolean;              // low luminance variance = clean bg
  score:            number;
  verdict:          "good" | "fair" | "poor";
  issue:            string | null;
}

export type AttireColorClass =
  | "pure_white"     // washes out on camera
  | "bright_red"     // bleeds / vibrates under video compression
  | "bright_yellow"  // harsh, distracting
  | "black"          // absorbs light — ok but can look severe
  | "dark_navy"      // ideal
  | "neutral_muted"  // ideal — greys, soft blues, earth tones
  | "pattern"        // high spatial frequency → moiré risk
  | "unknown";

export interface AttireReport {
  dominantRgb:     [number,number,number]; // average RGB of torso region
  dominantHsl:     [number,number,number]; // h 0–360, s 0–100, l 0–100
  colorClass:      AttireColorClass;
  colorVariance:   number;   // std-dev of hue across torso pixels — high = patterned
  brightnessValue: number;   // 0–255
  saturationValue: number;   // 0–100
  moireRisk:       boolean;
  torsoPixelCount: number;   // confidence indicator
  score:           number;
  verdict:         "good" | "fair" | "poor";
  issue:           string | null;
  suggestion:      string | null;
}

export interface AudioEnvironmentReport {
  noiseFloorDb:       number;
  peakDb:             number;
  hasBackgroundNoise: boolean;
  externalEventCount: number;  // sudden spikes > 18 dB above running average
  echoDetected:       boolean;
  spectralFlatness:   number;  // 0–1 — high = broadband noise (fan/AC)
  score:              number;
  verdict:            "good" | "fair" | "poor";
  issue:              string | null;
}

export interface EnvironmentReport {
  lighting:     LightingReport;
  camera:       CameraReport;
  background:   BackgroundReport;
  attire:       AttireReport;
  audio:        AudioEnvironmentReport;
  overallScore: number;
  criticalIssues: string[];
  suggestions:    string[];
}

// ─── MediaPipe landmark indices ───────────────────────────────────────────────

// Face Mesh (468 + 10 iris refinement)
const FACE = {
  FOREHEAD:     10,   // top-centre of forehead
  CHIN:        152,   // bottom of chin
  LEFT_CHEEK:  234,   // leftmost face point
  RIGHT_CHEEK: 454,   // rightmost face point
  LEFT_EYE:     33,
  RIGHT_EYE:   263,
  NOSE_TIP:      1,
};

// Pose (33 landmarks)
const POSE = {
  LEFT_EAR:        7,
  RIGHT_EAR:       8,
  LEFT_SHOULDER:  11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP:       23,
  RIGHT_HIP:      24,
};

// ─── Math helpers ─────────────────────────────────────────────────────────────

function lum709(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l   = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else                h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function variance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
}

function avgField<T>(samples: T[], key: keyof T): number {
  if (!samples.length) return 0;
  const vals = samples.map(s => s[key] as unknown as number).filter(v => isFinite(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

// ─── EnvironmentAnalyzer ──────────────────────────────────────────────────────

export class EnvironmentAnalyzer {
  // Main canvas (current frame)
  private canvas:  HTMLCanvasElement;
  private ctx:     CanvasRenderingContext2D;

  // Previous-frame canvas for motion detection
  private prevCanvas: HTMLCanvasElement;
  private prevCtx:    CanvasRenderingContext2D;
  private hasPrevFrame = false;

  private audioCtx:     AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx    = this.canvas.getContext("2d", { willReadFrequently: true })!;
    this.prevCanvas = document.createElement("canvas");
    this.prevCtx    = this.prevCanvas.getContext("2d", { willReadFrequently: true })!;
  }

  // ── Main entry ────────────────────────────────────────────────────────────

  async analyze(
    videoEl:      HTMLVideoElement,
    audioStream:  MediaStream,
    landmarkRefs: {
      getFaceLandmarks: () => any[] | null;
      getPoseLandmarks: () => any[] | null;
    },
    options: { sampleCount?: number; sampleIntervalMs?: number } = {}
  ): Promise<EnvironmentReport> {
    const N    = options.sampleCount      ?? 8;
    const GAP  = options.sampleIntervalMs ?? 350;

    await this.initAudio(audioStream);

    const lightingSamples:    LightingReport[]    = [];
    const backgroundSamples:  BackgroundReport[]  = [];
    const cameraSamples:      CameraReport[]      = [];
    const attireSamples:      AttireReport[]      = [];

    for (let i = 0; i < N; i++) {
      await this.wait(GAP);

      const frame = this.captureFrame(videoEl);
      if (!frame) continue;

      // Grab the freshest landmarks at this exact moment
      const face = landmarkRefs.getFaceLandmarks();
      const pose = landmarkRefs.getPoseLandmarks();

      lightingSamples.push(   this.sampleLighting(frame, face));
      backgroundSamples.push( this.sampleBackground(frame, face, pose));
      cameraSamples.push(     this.sampleCameraAngle(frame, face));

      if (pose && pose.length > 24) {
        attireSamples.push(   this.sampleAttire(frame, pose));
      }
    }

    // Aggregate: take medians for categorical fields, averages for numeric ones
    const lighting   = this.aggregateLighting(lightingSamples);
    const background = this.aggregateBackground(backgroundSamples);
    const camera     = this.aggregateCamera(cameraSamples);
    const attire     = this.aggregateAttire(attireSamples);
    const audio      = await this.sampleAudio();

    this.audioCtx?.close();

    const overallScore = Math.round(
      lighting.score   * 0.28 +
      camera.score     * 0.22 +
      background.score * 0.18 +
      attire.score     * 0.14 +
      audio.score      * 0.18
    );

    const { criticalIssues, suggestions } =
      this.buildGuidance(lighting, camera, background, attire, audio);

    return { lighting, camera, background, attire, audio, overallScore, criticalIssues, suggestions };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. LIGHTING
  // Uses the real face bounding box from landmarks for face brightness.
  // Samples background from pixels *outside* that box.
  // Colour temperature from R/B ratio inside the face region.
  // ─────────────────────────────────────────────────────────────────────────

  private sampleLighting(frame: ImageData, face: any[] | null): LightingReport {
    const { data, width, height } = frame;

    // Whole-frame luminance
    let totalLum = 0;
    const totalPx = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      totalLum += lum709(data[i], data[i+1], data[i+2]);
    }
    const avgBrightness = totalLum / totalPx;

    // Face bounding box from landmarks — use cheek/forehead/chin points
    let fxMin: number, fxMax: number, fyMin: number, fyMax: number;
    if (face && face.length > 454) {
      fxMin = Math.floor(Math.min(face[FACE.LEFT_CHEEK]?.x  ?? 0.28, face[FACE.RIGHT_CHEEK]?.x ?? 0.72) * width);
      fxMax = Math.ceil( Math.max(face[FACE.LEFT_CHEEK]?.x  ?? 0.28, face[FACE.RIGHT_CHEEK]?.x ?? 0.72) * width);
      fyMin = Math.floor((face[FACE.FOREHEAD]?.y ?? 0.08)  * height);
      fyMax = Math.ceil( (face[FACE.CHIN]?.y     ?? 0.72)  * height);
      // Inset 10% horizontally to stay on skin, not hair
      const px = Math.round((fxMax - fxMin) * 0.10);
      fxMin += px; fxMax -= px;
    } else {
      fxMin = Math.floor(width  * 0.32);
      fxMax = Math.floor(width  * 0.68);
      fyMin = Math.floor(height * 0.08);
      fyMax = Math.floor(height * 0.60);
    }
    fxMin = clamp(fxMin, 0, width-1);  fxMax = clamp(fxMax, 0, width-1);
    fyMin = clamp(fyMin, 0, height-1); fyMax = clamp(fyMax, 0, height-1);

    // Sample face region
    let faceLumSum = 0, faceRSum = 0, faceBSum = 0, faceN = 0;
    for (let y = fyMin; y <= fyMax; y += 2) {
      for (let x = fxMin; x <= fxMax; x += 2) {
        const i = (y * width + x) * 4;
        faceLumSum += lum709(data[i], data[i+1], data[i+2]);
        faceRSum   += data[i];
        faceBSum   += data[i+2];
        faceN++;
      }
    }
    const faceBrightness = faceN > 0 ? faceLumSum / faceN : avgBrightness;

    // Colour temperature: R/B ratio in face region
    const rbRatio = faceN > 0 ? (faceRSum / faceN) / ((faceBSum / faceN) + 1) : 1;
    const colorTemperature: LightingReport["colorTemperature"] =
      rbRatio > 1.30 ? "warm" : rbRatio < 0.82 ? "cool" : "neutral";

    // Background: upper half of frame, outside face box
    let bgLumSum = 0, bgN = 0;
    const bgYMax = Math.floor(height * 0.50);
    for (let y = 0; y < bgYMax; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if (x >= fxMin && x <= fxMax && y >= fyMin && y <= fyMax) continue;
        const i = (y * width + x) * 4;
        bgLumSum += lum709(data[i], data[i+1], data[i+2]);
        bgN++;
      }
    }
    const backgroundBrightness = bgN > 0 ? bgLumSum / bgN : avgBrightness;
    const backlightDetected     = backgroundBrightness - faceBrightness > 45;
    const contrastRatio         = backgroundBrightness / (faceBrightness + 1);

    // Score
    let score = 100, issue: string | null = null;
    if (backlightDetected) {
      score -= 40;
      issue = `Backlight detected (bg ${Math.round(backgroundBrightness)} vs face ${Math.round(faceBrightness)} brightness) — move the window behind you out of shot, or draw a blind.`;
    }
    if (faceBrightness < 55) {
      score -= 30;
      issue = issue ?? `Underexposed face (brightness ${Math.round(faceBrightness)}/255) — add a light source in front of you.`;
    } else if (faceBrightness > 225) {
      score -= 20;
      issue = issue ?? "Overexposed face — reduce light intensity or angle it slightly away.";
    }
    if (colorTemperature === "warm" && faceBrightness < 120) {
      score -= 8;
      issue = issue ?? "Warm, dim lighting — can give a tired appearance on camera.";
    }
    if (contrastRatio > 2.8 && !backlightDetected) {
      score -= 8;
      issue = issue ?? "High background/face contrast — camera auto-exposure will keep fluctuating.";
    }

    return {
      avgBrightness:        Math.round(avgBrightness),
      faceBrightness:       Math.round(faceBrightness),
      backgroundBrightness: Math.round(backgroundBrightness),
      backlightDetected,
      contrastRatio:        Math.round(contrastRatio * 100) / 100,
      colorTemperature,
      score:   clamp(score, 0, 100),
      verdict: score >= 75 ? "good" : score >= 45 ? "fair" : "poor",
      issue,
    };
  }

  private aggregateLighting(samples: LightingReport[]): LightingReport {
    if (!samples.length) return this.fallbackLighting();
    const base = this.medianByScore(samples);
    return {
      ...base,
      avgBrightness:        Math.round(avgField(samples, "avgBrightness")),
      faceBrightness:       Math.round(avgField(samples, "faceBrightness")),
      backgroundBrightness: Math.round(avgField(samples, "backgroundBrightness")),
      contrastRatio:        Math.round(avgField(samples, "contrastRatio") * 100) / 100,
      // backlightDetected: true if majority of samples detected it
      backlightDetected: samples.filter(s => s.backlightDetected).length > samples.length / 2,
      // colorTemperature: mode
      colorTemperature: this.mode(samples.map(s => s.colorTemperature)) as LightingReport["colorTemperature"],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CAMERA ANGLE
  // Uses the forehead (LM 10) and chin (LM 152) vertical positions.
  // Nose-relative-to-eyes pitch adds additional tilt signal.
  // ─────────────────────────────────────────────────────────────────────────

  private sampleCameraAngle(_frame: ImageData, face: any[] | null): CameraReport {
    if (!face || face.length < 200) return this.fallbackCamera();

    const forehead = face[FACE.FOREHEAD]    ?? { y: 0.15 };
    const chin     = face[FACE.CHIN]        ?? { y: 0.65 };
    const lEye     = face[FACE.LEFT_EYE]    ?? { y: 0.38 };
    const rEye     = face[FACE.RIGHT_EYE]   ?? { y: 0.38 };
    const nose     = face[FACE.NOSE_TIP]    ?? { y: 0.50 };

    const foreheadYNorm  = forehead.y as number;
    const chinYNorm      = chin.y     as number;
    const faceVerticalSpan = chinYNorm - foreheadYNorm;
    const faceMidY = (foreheadYNorm + chinYNorm) / 2;

    const eyeMidY       = ((lEye.y as number) + (rEye.y as number)) / 2;
    const eyeToChinSpan = chinYNorm - eyeMidY;
    // noseFraction: where nose sits in the eye→chin span
    // ~0.55 = level camera; >0.65 = camera below eye level
    const noseFraction  = eyeToChinSpan > 0.01
      ? ((nose.y as number) - eyeMidY) / eyeToChinSpan
      : 0.55;

    const pitchDeg      = (noseFraction - 0.55) * 80;
    // Frame-position penalty: face mid below 58% = camera too low
    const framePenalty  = faceMidY > 0.58 ? (faceMidY - 0.58) * 110 : 0;
    const estimatedAngleDeg = pitchDeg + framePenalty * 0.45;

    let score = 100, issue: string | null = null;
    if (estimatedAngleDeg > 7) {
      const sev = clamp((estimatedAngleDeg - 7) / 18, 0, 1);
      score -= Math.round(sev * 55);
      const cm = Math.round(estimatedAngleDeg * 0.9);
      issue = `Camera is ~${Math.round(estimatedAngleDeg)}° below eye level — raise your laptop ~${cm} cm (stack books or use a stand).`;
    } else if (estimatedAngleDeg < -10) {
      score -= 15;
      issue = "Camera appears slightly above eye level — lower it to be eye-height.";
    }
    if (faceVerticalSpan < 0.20) {
      score -= 15;
      issue = issue ?? "You appear far from the camera — move closer so your head fills ~30–40% of the frame.";
    }

    return {
      estimatedAngleDeg: Math.round(estimatedAngleDeg * 10) / 10,
      foreheadYNorm:     Math.round(foreheadYNorm * 1000) / 1000,
      chinYNorm:         Math.round(chinYNorm     * 1000) / 1000,
      faceVerticalSpan:  Math.round(faceVerticalSpan * 1000) / 1000,
      isAboveEyeLevel:   estimatedAngleDeg > 7,
      score:   clamp(score, 0, 100),
      verdict: score >= 75 ? "good" : score >= 45 ? "fair" : "poor",
      issue,
    };
  }

  private aggregateCamera(samples: CameraReport[]): CameraReport {
    if (!samples.length) return this.fallbackCamera();
    const base = this.medianByScore(samples);
    return {
      ...base,
      estimatedAngleDeg: Math.round(avgField(samples, "estimatedAngleDeg") * 10) / 10,
      foreheadYNorm:     Math.round(avgField(samples, "foreheadYNorm") * 1000) / 1000,
      chinYNorm:         Math.round(avgField(samples, "chinYNorm")     * 1000) / 1000,
      faceVerticalSpan:  Math.round(avgField(samples, "faceVerticalSpan") * 1000) / 1000,
      isAboveEyeLevel:   samples.filter(s => s.isAboveEyeLevel).length > samples.length / 2,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. BACKGROUND
  // Samples ONLY pixels outside the person bounding box (from pose landmarks).
  // Motion uses inter-frame pixel difference on the background region only.
  // ─────────────────────────────────────────────────────────────────────────

  private sampleBackground(
    frame: ImageData,
    face:  any[] | null,
    pose:  any[] | null
  ): BackgroundReport {
    const { data, width, height } = frame;

    // Build person bounding box — prefer pose (more accurate body coverage)
    let pxMin: number, pxMax: number, pyMin: number, pyMax: number;

    if (pose && pose.length > 24) {
      const ls = pose[POSE.LEFT_SHOULDER],  rs = pose[POSE.RIGHT_SHOULDER];
      const lh = pose[POSE.LEFT_HIP],       rh = pose[POSE.RIGHT_HIP];
      const le = pose[POSE.LEFT_EAR],       re = pose[POSE.RIGHT_EAR];
      pxMin = Math.floor(Math.min(ls?.x ?? 0.2, rs?.x ?? 0.2, le?.x ?? 0.2, re?.x ?? 0.2) * width  - width  * 0.06);
      pxMax = Math.ceil( Math.max(ls?.x ?? 0.8, rs?.x ?? 0.8, le?.x ?? 0.8, re?.x ?? 0.8) * width  + width  * 0.06);
      pyMin = Math.floor(Math.min(le?.y ?? 0.05, re?.y ?? 0.05) * height - height * 0.04);
      pyMax = Math.ceil( Math.max(lh?.y ?? 0.70, rh?.y ?? 0.70) * height + height * 0.04);
    } else if (face && face.length > 454) {
      const fx1 = (face[FACE.LEFT_CHEEK]?.x  ?? 0.25) * width;
      const fx2 = (face[FACE.RIGHT_CHEEK]?.x ?? 0.75) * width;
      const fy1 = (face[FACE.FOREHEAD]?.y    ?? 0.05) * height;
      const fy2 = (face[FACE.CHIN]?.y        ?? 0.70) * height;
      const mx  = (fx2 - fx1) * 0.35, my = (fy2 - fy1) * 0.20;
      pxMin = Math.floor(fx1 - mx);  pxMax = Math.ceil(fx2 + mx);
      pyMin = Math.floor(fy1 - my);  pyMax = Math.ceil(fy2 + my * 4);
    } else {
      pxMin = Math.floor(width  * 0.18); pxMax = Math.floor(width  * 0.82);
      pyMin = 0;                         pyMax = Math.floor(height * 0.85);
    }

    pxMin = clamp(pxMin, 0, width-1);  pxMax = clamp(pxMax, 0, width-1);
    pyMin = clamp(pyMin, 0, height-1); pyMax = clamp(pyMax, 0, height-1);

    const STEP = 6;
    const bgLums:   number[]   = [];
    const bgPixels: number[][] = [];

    for (let y = 0; y < height; y += STEP) {
      for (let x = 0; x < width; x += STEP) {
        if (x >= pxMin && x <= pxMax && y >= pyMin && y <= pyMax) continue;
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        bgLums.push(lum709(r, g, b));
        bgPixels.push([r, g, b]);
      }
    }

    // Edge density proxy: std-dev of adjacent-pixel luminance differences
    let edgeSum = 0;
    for (let i = 1; i < bgLums.length; i++) {
      edgeSum += Math.abs(bgLums[i] - bgLums[i-1]);
    }
    const edgeDensity = bgLums.length > 1
      ? clamp(edgeSum / (bgLums.length * 22), 0, 1)
      : 0;

    const bgVariance  = variance(bgLums);
    const isUniform   = bgVariance < 280;

    // Dominant background colour (simple mean)
    let dominantBgColor: [number,number,number] | null = null;
    if (bgPixels.length > 0) {
      const avgR = bgPixels.reduce((s, p) => s + p[0], 0) / bgPixels.length;
      const avgG = bgPixels.reduce((s, p) => s + p[1], 0) / bgPixels.length;
      const avgB = bgPixels.reduce((s, p) => s + p[2], 0) / bgPixels.length;
      dominantBgColor = [Math.round(avgR), Math.round(avgG), Math.round(avgB)];
    }

    // Inter-frame motion on background region only
    let motionScore = 0;
    if (this.hasPrevFrame) {
      this.prevCanvas.width = width; this.prevCanvas.height = height;
      const prevData = this.prevCtx.getImageData(0, 0, width, height).data;
      let diffSum = 0, diffN = 0;
      for (let y = 0; y < height; y += STEP * 2) {
        for (let x = 0; x < width; x += STEP * 2) {
          if (x >= pxMin && x <= pxMax && y >= pyMin && y <= pyMax) continue;
          const i = (y * width + x) * 4;
          diffSum += (Math.abs(data[i] - prevData[i]) +
                      Math.abs(data[i+1] - prevData[i+1]) +
                      Math.abs(data[i+2] - prevData[i+2]));
          diffN++;
        }
      }
      motionScore = diffN > 0 ? clamp(diffSum / (diffN * 3 * 28), 0, 1) : 0;
    }
    // Snapshot current frame into prev canvas for next sample
    this.prevCanvas.width = width; this.prevCanvas.height = height;
    this.prevCtx.drawImage(this.canvas, 0, 0);
    this.hasPrevFrame = true;

    // Score
    let score = 100, issue: string | null = null;
    if (edgeDensity > 0.55) {
      score -= 35;
      issue = "Busy or cluttered background — distracts the interviewer and degrades AI facial analysis. Use a plain wall or enable background blur.";
    } else if (edgeDensity > 0.30) {
      score -= 15;
      issue = "Moderately complex background — simpler is better on video.";
    }
    if (motionScore > 0.35) {
      score -= 25;
      issue = issue ?? "Consistent movement in your background detected — a person, pet, or fan in shot.";
    } else if (motionScore > 0.15) {
      score -= 10;
      issue = issue ?? "Occasional background movement detected.";
    }
    if (!isUniform && score > 65) score -= 8;

    return {
      edgeDensity:     Math.round(edgeDensity * 1000) / 1000,
      motionScore:     Math.round(motionScore * 1000) / 1000,
      dominantBgColor,
      isUniform,
      score:   clamp(score, 0, 100),
      verdict: score >= 75 ? "good" : score >= 45 ? "fair" : "poor",
      issue,
    };
  }

  private aggregateBackground(samples: BackgroundReport[]): BackgroundReport {
    if (!samples.length) return this.fallbackBackground();
    const base = this.medianByScore(samples);
    // dominantBgColor: average across samples
    const colorSamples = samples.map(s => s.dominantBgColor).filter(Boolean) as [number,number,number][];
    const dominantBgColor: [number,number,number] | null = colorSamples.length
      ? [
          Math.round(colorSamples.reduce((s, c) => s + c[0], 0) / colorSamples.length),
          Math.round(colorSamples.reduce((s, c) => s + c[1], 0) / colorSamples.length),
          Math.round(colorSamples.reduce((s, c) => s + c[2], 0) / colorSamples.length),
        ]
      : null;
    return {
      ...base,
      edgeDensity:     Math.round(avgField(samples, "edgeDensity")  * 1000) / 1000,
      motionScore:     Math.round(avgField(samples, "motionScore")   * 1000) / 1000,
      dominantBgColor,
      isUniform:       samples.filter(s => s.isUniform).length > samples.length / 2,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ATTIRE
  //
  // Pixel-sample the torso polygon defined by pose shoulder / hip landmarks.
  // We sample the upper-torso zone (shoulders down to ~40% toward hips) to
  // avoid picking up desk or lap pixels.
  //
  // From those pixels:
  //   • Dominant HSL  → colour class (pure_white, bright_red, pattern …)
  //   • Hue variance  → high = striped / patterned clothing
  //   • Block variance → spatial frequency → moiré risk on video compression
  //   • Saturation    → neon / over-vivid warning
  // ─────────────────────────────────────────────────────────────────────────

  private sampleAttire(frame: ImageData, pose: any[]): AttireReport {
    const { data, width, height } = frame;

    const toPixel = (lm: any) => ({
      x: Math.round((lm?.x ?? 0.5) * width),
      y: Math.round((lm?.y ?? 0.5) * height),
    });

    const ls = toPixel(pose[POSE.LEFT_SHOULDER]);
    const rs = toPixel(pose[POSE.RIGHT_SHOULDER]);
    const lh = toPixel(pose[POSE.LEFT_HIP]);
    const rh = toPixel(pose[POSE.RIGHT_HIP]);

    // Upper-torso bounding box: shoulder top → 40% toward hips
    const torsoTop    = Math.min(ls.y, rs.y);
    const torsoBottom = Math.round(torsoTop + (Math.max(lh.y, rh.y) - torsoTop) * 0.42);
    // Inset 8% from each shoulder to avoid arm pixels
    const shoulderW   = Math.abs(rs.x - ls.x);
    const torsoLeft   = Math.min(ls.x, rs.x) + Math.round(shoulderW * 0.08);
    const torsoRight  = Math.max(ls.x, rs.x) - Math.round(shoulderW * 0.08);

    const xMin = clamp(torsoLeft,  0, width-1);
    const xMax = clamp(torsoRight, 0, width-1);
    const yMin = clamp(torsoTop    + Math.round((torsoBottom - torsoTop) * 0.04), 0, height-1);
    const yMax = clamp(torsoBottom, 0, height-1);

    if (xMax - xMin < 10 || yMax - yMin < 10) return this.fallbackAttire();

    const hArr: number[] = [], sArr: number[] = [], lArr: number[] = [];
    const rArr: number[] = [], gArr: number[] = [], bArr: number[] = [];

    // 8×8 block luminance variance — proxy for spatial frequency / moiré
    const BLOCK = 8, STEP = 3;
    const blockVars: number[] = [];

    for (let y = yMin; y <= yMax; y += STEP) {
      for (let x = xMin; x <= xMax; x += STEP) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        const [h, s, l] = rgbToHsl(r, g, b);
        hArr.push(h); sArr.push(s); lArr.push(l);
        rArr.push(r); gArr.push(g); bArr.push(b);
      }
    }
    // Block-level luminance variance
    for (let y = yMin; y <= yMax; y += BLOCK) {
      for (let x = xMin; x <= xMax; x += BLOCK) {
        const blockLums: number[] = [];
        for (let by = 0; by < BLOCK && y + by < height; by++) {
          for (let bx = 0; bx < BLOCK && x + bx < width; bx++) {
            const i = ((y+by) * width + (x+bx)) * 4;
            blockLums.push(lum709(data[i], data[i+1], data[i+2]));
          }
        }
        blockVars.push(variance(blockLums));
      }
    }

    const n = hArr.length;
    if (n < 20) return this.fallbackAttire();

    const avgH = hArr.reduce((a,b) => a+b, 0) / n;
    const avgS = sArr.reduce((a,b) => a+b, 0) / n;
    const avgL = lArr.reduce((a,b) => a+b, 0) / n;
    const avgR = rArr.reduce((a,b) => a+b, 0) / n;
    const avgG = gArr.reduce((a,b) => a+b, 0) / n;
    const avgB = bArr.reduce((a,b) => a+b, 0) / n;

    // Colour variance: combine hue variance and lightness variance
    const hVar = variance(hArr);
    const lVar = variance(lArr);
    const colorVariance = Math.sqrt(hVar * 0.6 + lVar * 0.4);

    // Spatial frequency: average block variance
    const avgBlockVar = blockVars.reduce((a,b) => a+b, 0) / (blockVars.length || 1);
    const moireRisk = avgBlockVar > 750 || colorVariance > 38;

    const colorClass = this.classifyColor(avgH, avgS, avgL, colorVariance, moireRisk);

    // Score
    let score = 100, issue: string | null = null, suggestion: string | null = null;

    switch (colorClass) {
      case "pure_white":
        score -= 30;
        issue = "Pure white clothing detected — white can wash out your face on camera and trigger auto-exposure fluctuations.";
        suggestion = "Switch to off-white, light grey, or a soft pastel — they photograph cleaner on video.";
        break;
      case "bright_red":
        score -= 25;
        issue = "Bright red clothing detected — red bleeds under video compression and can appear overly intense on screen.";
        suggestion = "Prefer muted tones: navy, charcoal, forest green, or dusty rose.";
        break;
      case "bright_yellow":
        score -= 20;
        issue = "Bright yellow detected — very high-chroma colours are distracting during an interview.";
        suggestion = "Switch to a softer, lower-saturation colour.";
        break;
      case "pattern":
        score -= 35;
        issue = moireRisk
          ? "High-frequency pattern detected (stripes, checks, or herringbone) — this causes moiré aliasing on video compression."
          : "Busy patterned clothing detected — patterns draw the eye away from your face during an interview.";
        suggestion = "Wear a solid colour. Fine stripes and tight checks look worst on video.";
        break;
      case "black":
        score -= 10;
        suggestion = "Black is fine but can look severe under harsh lighting — dark navy or charcoal reads better.";
        break;
      case "dark_navy":
      case "neutral_muted":
        // Best choices — no deductions
        break;
    }

    // Saturation penalty regardless of class
    if (avgS > 68 && colorClass !== "pattern") {
      score -= 12;
      issue = issue ?? `High colour saturation (${Math.round(avgS)}%) detected — very vivid colours can be distracting on video.`;
      suggestion = suggestion ?? "Lower-saturation tones look more professional on camera.";
    }

    // Low confidence: if we sampled very few pixels, don't heavily penalise
    if (n < 80) score = Math.max(score, 55);

    return {
      dominantRgb:     [Math.round(avgR), Math.round(avgG), Math.round(avgB)],
      dominantHsl:     [Math.round(avgH), Math.round(avgS), Math.round(avgL)],
      colorClass,
      colorVariance:   Math.round(colorVariance * 10) / 10,
      brightnessValue: Math.round(avgL * 2.55),
      saturationValue: Math.round(avgS),
      moireRisk,
      torsoPixelCount: n,
      score:   clamp(score, 0, 100),
      verdict: score >= 75 ? "good" : score >= 45 ? "fair" : "poor",
      issue,
      suggestion,
    };
  }

  private classifyColor(
    h: number, s: number, l: number,
    variance: number, moireRisk: boolean
  ): AttireColorClass {
    if (moireRisk || variance > 40)            return "pattern";
    if (l > 88 && s < 12)                      return "pure_white";
    if (l < 14)                                return "black";
    if ((h < 18 || h > 342) && s > 55 && l > 25) return "bright_red";
    if (h >= 48 && h <= 65 && s > 55)         return "bright_yellow";
    if (h >= 200 && h <= 250 && l < 32)       return "dark_navy";
    if (s < 48)                                return "neutral_muted";
    return "neutral_muted";
  }

  private aggregateAttire(samples: AttireReport[]): AttireReport {
    if (!samples.length) return this.fallbackAttire();
    const base = this.medianByScore(samples);
    const avgRr = Math.round(samples.reduce((s,a) => s + a.dominantRgb[0], 0) / samples.length);
    const avgRg = Math.round(samples.reduce((s,a) => s + a.dominantRgb[1], 0) / samples.length);
    const avgRb = Math.round(samples.reduce((s,a) => s + a.dominantRgb[2], 0) / samples.length);
    const [ah, as_, al] = rgbToHsl(avgRr, avgRg, avgRb);

    return {
      ...base,
      dominantRgb:     [avgRr, avgRg, avgRb],
      dominantHsl:     [ah, as_, al],
      colorVariance:   Math.round(avgField(samples, "colorVariance") * 10) / 10,
      brightnessValue: Math.round(avgField(samples, "brightnessValue")),
      saturationValue: Math.round(avgField(samples, "saturationValue")),
      moireRisk:       samples.filter(s => s.moireRisk).length > samples.length / 2,
      torsoPixelCount: Math.round(avgField(samples, "torsoPixelCount")),
      colorClass:      this.mode(samples.map(s => s.colorClass)) as AttireColorClass,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. AUDIO ENVIRONMENT
  // Spectral flatness distinguishes broadband noise (fan = flat spectrum)
  // from tonal content. Echo detected via low-freq energy dominance.
  // ─────────────────────────────────────────────────────────────────────────

  private async initAudio(stream: MediaStream): Promise<void> {
    this.audioCtx     = new AudioContext();
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 4096;
    this.analyserNode.smoothingTimeConstant = 0.25;
    const src = this.audioCtx.createMediaStreamSource(stream);
    src.connect(this.analyserNode);
  }

  private async sampleAudio(): Promise<AudioEnvironmentReport> {
    if (!this.analyserNode || !this.audioCtx) {
      return { noiseFloorDb: -60, peakDb: -30, hasBackgroundNoise: false,
               externalEventCount: 0, echoDetected: false, spectralFlatness: 0,
               score: 70, verdict: "fair", issue: "Audio context unavailable" };
    }

    const sr      = this.audioCtx.sampleRate;
    const binN    = this.analyserNode.frequencyBinCount;
    const hzBin   = (sr / 2) / binN;
    const loSpeech = Math.floor(300  / hzBin);
    const hiSpeech = Math.floor(3000 / hzBin);
    const hiLow    = Math.floor(200  / hzBin);

    const dbSamples: number[]   = [];
    const externalEvents: number[] = [];
    let   totalFlatness = 0;
    let   peakDb        = -100;

    const COUNT = 20, INTERVAL = 150;

    for (let i = 0; i < COUNT; i++) {
      await this.wait(INTERVAL);
      const freq = new Float32Array(binN);
      this.analyserNode.getFloatFrequencyData(freq);

      // Speech-band average
      const band  = Array.from(freq.slice(loSpeech, hiSpeech));
      const avgDb = band.reduce((a, b) => a + b, 0) / (band.length || 1);
      dbSamples.push(avgDb);
      peakDb = Math.max(peakDb, avgDb);

      // External event
      if (dbSamples.length > 3) {
        const recent = dbSamples.slice(-4, -1).reduce((a,b) => a+b, 0) / 3;
        if (avgDb - recent > 18) externalEvents.push(i);
      }

      // Spectral flatness (Wiener entropy) on full spectrum
      const lins = Array.from(freq.slice(0, binN / 2)).map(db => Math.pow(10, db/20) + 1e-10);
      const geo  = Math.exp(lins.reduce((s,v) => s + Math.log(v), 0) / lins.length);
      const arith= lins.reduce((s,v) => s + v, 0) / lins.length;
      totalFlatness += geo / (arith + 1e-10);
    }

    const sorted       = [...dbSamples].sort((a,b) => a - b);
    const noiseFloorDb = sorted[Math.floor(sorted.length * 0.20)] ?? -60;
    const avgFlatness  = totalFlatness / COUNT;
    const hasNoise     = noiseFloorDb > -44;

    // Echo: low-freq dominance in final snapshot
    const finalFreq = new Float32Array(binN);
    this.analyserNode.getFloatFrequencyData(finalFreq);
    const lowAvg    = Array.from(finalFreq.slice(1, hiLow)).reduce((a,b) => a+b, 0) / hiLow;
    const speechAvg = Array.from(finalFreq.slice(loSpeech, hiSpeech)).reduce((a,b) => a+b, 0) / (hiSpeech - loSpeech);
    const echoDetected = lowAvg > speechAvg + 8;

    let score = 100, issue: string | null = null;
    if (hasNoise) {
      const sev = clamp((noiseFloorDb + 44) / 20, 0, 1);
      score -= Math.round(sev * 35 + 10);
      const noiseType = avgFlatness > 0.12 ? " (broadband — likely fan or AC)" : "";
      issue = `Background noise at ~${Math.round(noiseFloorDb)} dBFS${noiseType}. Close doors, turn off fans, or switch to earphones.`;
    }
    if (echoDetected) {
      score -= 22;
      issue = issue ?? "Room echo detected — likely built-in mic in a reflective room. Earphones with a mic eliminate this.";
    }
    if (externalEvents.length > 2) {
      score -= clamp(externalEvents.length * 4, 0, 18);
      issue = issue ?? `${externalEvents.length} sudden audio event(s) — notifications or external sounds.`;
    }

    return {
      noiseFloorDb:     Math.round(noiseFloorDb * 10) / 10,
      peakDb:           Math.round(peakDb       * 10) / 10,
      hasBackgroundNoise: hasNoise,
      externalEventCount: externalEvents.length,
      echoDetected,
      spectralFlatness: Math.round(avgFlatness * 1000) / 1000,
      score:   clamp(score, 0, 100),
      verdict: score >= 75 ? "good" : score >= 45 ? "fair" : "poor",
      issue,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Guidance
  // ─────────────────────────────────────────────────────────────────────────

  private buildGuidance(
    l: LightingReport, c: CameraReport, b: BackgroundReport,
    a: AttireReport,   au: AudioEnvironmentReport
  ): { criticalIssues: string[]; suggestions: string[] } {
    const critical: string[] = [];
    const sugg:     string[] = [];

    const push = (verdict: string, issue: string | null, suggestion?: string | null) => {
      if (!issue) return;
      if (verdict === "poor") critical.push(issue);
      else if (verdict === "fair") sugg.push(issue);
      if (suggestion) sugg.push(suggestion);
    };

    push(l.verdict,  l.issue);
    push(c.verdict,  c.issue);
    push(b.verdict,  b.issue);
    push(a.verdict,  a.issue, a.suggestion);
    push(au.verdict, au.issue);

    if (!critical.length && !sugg.length) {
      sugg.push("Environment looks great — lighting, camera angle, background, attire, and audio are all in good ranges.");
    }

    return { criticalIssues: critical, suggestions: sugg };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  private captureFrame(videoEl: HTMLVideoElement): ImageData | null {
    const { videoWidth: w, videoHeight: h } = videoEl;
    if (!w || !h) return null;
    this.canvas.width = w; this.canvas.height = h;
    this.ctx.drawImage(videoEl, 0, 0, w, h);
    return this.ctx.getImageData(0, 0, w, h);
  }

  /** Pick the sample whose score is closest to the median score */
  private medianByScore<T extends { score: number }>(arr: T[]): T {
    const sorted = [...arr].sort((a, b) => a.score - b.score);
    return sorted[Math.floor(sorted.length / 2)];
  }

  /** Statistical mode of an array of strings */
  private mode(arr: string[]): string {
    const counts: Record<string, number> = {};
    for (const v of arr) counts[v] = (counts[v] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? arr[0];
  }

  private wait(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  // ─── Fallbacks (returned when not enough data is available) ──────────────

  private fallbackLighting(): LightingReport {
    return { avgBrightness: 128, faceBrightness: 128, backgroundBrightness: 128,
             backlightDetected: false, contrastRatio: 1, colorTemperature: "unknown",
             score: 55, verdict: "fair", issue: "Could not measure lighting — ensure camera is active." };
  }
  private fallbackCamera(): CameraReport {
    return { estimatedAngleDeg: 0, foreheadYNorm: 0.2, chinYNorm: 0.6,
             faceVerticalSpan: 0.4, isAboveEyeLevel: false,
             score: 55, verdict: "fair", issue: null };
  }
  private fallbackBackground(): BackgroundReport {
    return { edgeDensity: 0.2, motionScore: 0, dominantBgColor: null, isUniform: true,
             score: 70, verdict: "fair", issue: null };
  }
  private fallbackAttire(): AttireReport {
    return { dominantRgb: [128,128,128], dominantHsl: [0,0,50], colorClass: "unknown",
             colorVariance: 0, brightnessValue: 128, saturationValue: 0, moireRisk: false,
             torsoPixelCount: 0, score: 55, verdict: "fair",
             issue: "Torso not detected — ensure your upper body is visible in frame.",
             suggestion: null };
  }
}