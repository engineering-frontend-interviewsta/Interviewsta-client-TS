/**
 * speechAnalyzer.ts
 *
 * Runs entirely in the browser. Two parallel tracks:
 *
 * 1. Web Audio API  → real-time volume, noise floor, silence detection
 * 2. Web Speech API → live transcription, filler word counting, WPM tracking
 *
 * Produces a SpeechReport at session end that gets sent to the backend.
 *
 * Browser support: Chrome / Edge (Web Speech API). Firefox will get audio
 * stats only — transcription falls back to backend Whisper if unavailable.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpeechSegment {
    startMs: number;
    endMs: number;
    text: string;
    wordCount: number;
    wpm: number;
    fillerCount: number;
    fillerWords: string[];
    confidence: number;       // 0–1, from Web Speech API
    isFinal: boolean;
  }
  
  export interface SilenceGap {
    startMs: number;
    endMs: number;
    durationMs: number;
  }
  
  export interface AudioQualitySnapshot {
    timestamp: number;
    rmsDb: number;             // current volume in dBFS
    noiseFloorDb: number;      // estimated noise floor
    snrDb: number;             // signal-to-noise ratio
    clipping: boolean;
  }
  
  export interface SpeechReport {
    sessionDurationMs: number;
    segments: SpeechSegment[];
    silenceGaps: SilenceGap[];
    audioQualitySnapshots: AudioQualitySnapshot[];
  
    fillerWordCounts: Record<string, number>;  // { "um": 48, "like": 31, ... }
    topFillers: Array<{ word: string; count: number }>;
  
    stats: {
      totalWords: number;
      speakingTimeMs: number;
      avgWpm: number;
      maxWpm: number;
      minWpm: number;
      fillersPerMinute: number;
      deadPauseCount: number;          // silences > DEAD_PAUSE_THRESHOLD_MS
      longestSilenceMs: number;
      avgNoiseFloorDb: number;
      avgSnrDb: number;
      transcriptionConfidence: number; // 0–100
    };
  
    scores: {
      pace: number;           // 0–100 — how close to ideal WPM
      fillerDensity: number;  // 0–100 — inverse of fillers/min
      silenceControl: number; // 0–100 — penalises dead pauses
      audioClarity: number;   // 0–100 — based on SNR
      overall: number;
    };
  
    // Raw transcript concatenated (for backend re-analysis / LLM scoring)
    fullTranscript: string;
  }
  
  // ─── Constants ────────────────────────────────────────────────────────────────
  
  const FILLER_WORDS = new Set([
    "um", "uh", "er", "ah", "like", "basically", "literally", "actually",
    "you know", "i mean", "so yeah", "right", "kind of", "sort of",
    "you see", "well", "okay so", "and uh", "but uh",
  ]);
  
  const DEAD_PAUSE_THRESHOLD_MS = 5_000;   // 5s of silence = notable gap
  const NOISE_WINDOW_FRAMES = 30;          // frames to estimate noise floor
  const SILENCE_DB_THRESHOLD = -42;        // below this = silence
  const IDEAL_WPM_LOW  = 120;
  const IDEAL_WPM_HIGH = 160;
  const AUDIO_QUALITY_SAMPLE_INTERVAL_MS = 1_000;
  
  // ─── SpeechAnalyzer class ──────────────────────────────────────────────────────
  
  export class SpeechAnalyzer {
    private audioCtx: AudioContext | null = null;
    private analyserNode: AnalyserNode | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private recognition: any = null;   // SpeechRecognition
    /** Current non-final transcript from Web Speech API (cleared when a final lands). */
    private latestInterimTranscript = '';
    private activationUnsub: (() => void) | null = null;

    private startTime = 0;
    private running = false;
    private audioQualityTimer: ReturnType<typeof setInterval> | null = null;
  
    // Accumulated data
    private segments: SpeechSegment[] = [];
    private silenceGaps: SilenceGap[] = [];
    private audioSnapshots: AudioQualitySnapshot[] = [];
    private fillerWordCounts: Record<string, number> = {};
    private noiseBuffer: number[] = [];    // rolling dB values for noise floor
  
    // Silence tracking
    private lastSpeechEndMs = 0;
    private inSilence = false;
  
    // Interim segment state
    private currentSegmentStart = 0;

    /** Same stream as Web Audio; used to wait for an enabled live mic before Web Speech starts. */
    private mediaStream: MediaStream | null = null;
    private recognitionPollTimer: ReturnType<typeof setTimeout> | null = null;
    private recognitionKickTimer: ReturnType<typeof setTimeout> | null = null;
    private recognitionEndRestartTimer: ReturnType<typeof setTimeout> | null = null;
  
    // ── Init & start ──────────────────────────────────────────────────────────
  
    async start(stream: MediaStream): Promise<void> {
      this.startTime = performance.now();
      this.running = true;
      this.lastSpeechEndMs = 0;
      this.mediaStream = stream;
  
      await this.initAudio(stream);
      this.initSpeechRecognition();
      this.startAudioQualityLoop();
    }
  
    /** Latest audio quality sample for live UI. */
    peekLatestAudioSnapshot(): AudioQualitySnapshot | undefined {
      const n = this.audioSnapshots.length;
      return n > 0 ? this.audioSnapshots[n - 1] : undefined;
    }

    /** Latest speech segment for live WPM / fillers. */
    peekLatestSegment(): SpeechSegment | undefined {
      const n = this.segments.length;
      return n > 0 ? this.segments[n - 1] : undefined;
    }

    /** Live STT line + WPM using interim results (finals alone update too slowly for the dashboard). */
    peekLiveSpeechMetrics(): { latestText: string; liveWpm: number } {
      if (!this.running) return { latestText: '', liveWpm: 0 };

      const interim = this.latestInterimTranscript.trim();
      const now = performance.now() - this.startTime;

      if (interim) {
        const words = this.tokenize(interim);
        const startMs =
          this.currentSegmentStart > 0 ? this.currentSegmentStart : Math.max(0, now - 1500);
        const durMs = Math.max(250, now - startMs);
        const wpm = Math.round((words.length / durMs) * 60_000);
        const text = interim.length > 120 ? `${interim.slice(0, 120)}…` : interim;
        return { latestText: text, liveWpm: wpm };
      }

      const seg = this.peekLatestSegment();
      if (seg) {
        const t = seg.text.trim();
        const text = t.length > 120 ? `${t.slice(0, 120)}…` : t;
        return { latestText: text, liveWpm: seg.wpm };
      }

      return { latestText: '', liveWpm: 0 };
    }

    getTotalFillerCount(): number {
      return this.segments.reduce((a, s) => a + s.fillerCount, 0);
    }

    getTotalSpeakingTimeMs(): number {
      return this.segments.reduce((a, s) => a + (s.endMs - s.startMs), 0);
    }

    getSegmentCount(): number {
      return this.segments.length;
    }

    getTotalWordCount(): number {
      return this.segments.reduce((a, s) => a + s.wordCount, 0);
    }

    /** True when Web Speech API recognition is running (Chrome/Edge). */
    isWebSpeechActive(): boolean {
      return this.recognition != null;
    }

    stop(): SpeechReport {
      this.running = false;
  
      // Close any open silence gap
      if (this.inSilence && this.lastSpeechEndMs > 0) {
        const now = performance.now() - this.startTime;
        this.silenceGaps.push({
          startMs: this.lastSpeechEndMs,
          endMs: now,
          durationMs: now - this.lastSpeechEndMs,
        });
      }
  
      this.clearRecognitionTimers();
      try {
        this.recognition?.abort();
      } catch {
        try {
          this.recognition?.stop();
        } catch {
          /* ignore */
        }
      }
      this.recognition = null;
      this.mediaStream = null;
      this.activationUnsub?.();
      this.activationUnsub = null;
      this.audioCtx?.close();
      if (this.audioQualityTimer) clearInterval(this.audioQualityTimer);

      return this.buildReport();
    }
  
    // ── Audio setup ───────────────────────────────────────────────────────────
  
    private async initAudio(stream: MediaStream): Promise<void> {
      this.audioCtx = new AudioContext();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyserNode);
      // NOTE: do NOT connect to destination — we don't want echo

      // Browsers often start AudioContext suspended unless resumed from a user gesture.
      await this.audioCtx.resume().catch(() => {});
      this.attachAudioContextActivationHandlers();
    }

    private attachAudioContextActivationHandlers(): void {
      const ctx = this.audioCtx;
      if (!ctx || ctx.state === 'closed') return;

      const tryResume = () => {
        if (!this.running || !this.audioCtx || this.audioCtx.state === 'closed') return;
        void this.audioCtx.resume().catch(() => {});
      };

      tryResume();
      if (ctx.state === 'running') return;

      const onGesture = () => {
        tryResume();
        if (this.audioCtx?.state === 'running') {
          window.removeEventListener('pointerdown', onGesture, true);
          window.removeEventListener('keydown', onGesture, true);
          this.activationUnsub = null;
        }
      };

      window.addEventListener('pointerdown', onGesture, true);
      window.addEventListener('keydown', onGesture, true);
      this.activationUnsub = () => {
        window.removeEventListener('pointerdown', onGesture, true);
        window.removeEventListener('keydown', onGesture, true);
      };
    }
  
    private startAudioQualityLoop(): void {
      this.audioQualityTimer = setInterval(() => {
        if (!this.running || !this.analyserNode) return;
        const snapshot = this.captureAudioSnapshot();
        this.audioSnapshots.push(snapshot);
        this.updateNoiseFloor(snapshot.rmsDb);
      }, AUDIO_QUALITY_SAMPLE_INTERVAL_MS);
    }
  
    private captureAudioSnapshot(): AudioQualitySnapshot {
      const bufLen = this.analyserNode!.frequencyBinCount;
      const timeData = new Float32Array(bufLen);
      this.analyserNode!.getFloatTimeDomainData(timeData);
  
      // RMS → dBFS
      const rms = Math.sqrt(timeData.reduce((sum, v) => sum + v * v, 0) / bufLen);
      const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -100;
  
      // Clipping detection
      const clipping = Array.from(timeData).some(v => Math.abs(v) > 0.99);
  
      const noiseFloorDb = this.estimateNoiseFloor();
      const snrDb = rmsDb - noiseFloorDb;
  
      return {
        timestamp: performance.now() - this.startTime,
        rmsDb: Math.round(rmsDb * 10) / 10,
        noiseFloorDb: Math.round(noiseFloorDb * 10) / 10,
        snrDb: Math.round(snrDb * 10) / 10,
        clipping,
      };
    }
  
    private updateNoiseFloor(rmsDb: number): void {
      // Only update noise floor with quiet frames
      if (rmsDb < SILENCE_DB_THRESHOLD) {
        this.noiseBuffer.push(rmsDb);
        if (this.noiseBuffer.length > NOISE_WINDOW_FRAMES) {
          this.noiseBuffer.shift();
        }
      }
    }
  
    private estimateNoiseFloor(): number {
      if (this.noiseBuffer.length === 0) return -60;
      // Use the 10th percentile of quiet frames (more stable than mean)
      const sorted = [...this.noiseBuffer].sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * 0.1);
      return sorted[idx] ?? -60;
    }
  
    // ── Speech Recognition ────────────────────────────────────────────────────

    private clearRecognitionTimers(): void {
      if (this.recognitionPollTimer) {
        clearTimeout(this.recognitionPollTimer);
        this.recognitionPollTimer = null;
      }
      if (this.recognitionKickTimer) {
        clearTimeout(this.recognitionKickTimer);
        this.recognitionKickTimer = null;
      }
      if (this.recognitionEndRestartTimer) {
        clearTimeout(this.recognitionEndRestartTimer);
        this.recognitionEndRestartTimer = null;
      }
    }

    /** Web Speech needs at least one live, enabled audio track (mic off at mount is common on InterviewInterface). */
    private streamHasLiveAudio(): boolean {
      const s = this.mediaStream;
      if (!s) return false;
      return s.getAudioTracks().some((t) => t.readyState === "live" && t.enabled);
    }

    private scheduleRecognitionRestart(): void {
      if (!this.running || !this.recognition) return;
      this.clearRecognitionTimers();
      this.recognitionEndRestartTimer = window.setTimeout(() => {
        this.recognitionEndRestartTimer = null;
        if (!this.running || !this.recognition) return;
        if (!this.streamHasLiveAudio()) {
          this.tryStartSpeechRecognitionLoop();
          return;
        }
        try {
          this.recognition.start();
        } catch {
          this.recognitionEndRestartTimer = window.setTimeout(() => {
            this.scheduleRecognitionRestart();
          }, 400);
        }
      }, 180);
    }

    /** Poll until the interview mic is enabled, then call recognition.start() (avoids silent STT when track starts disabled). */
    private tryStartSpeechRecognitionLoop(): void {
      if (!this.running || !this.recognition) return;

      if (!this.streamHasLiveAudio()) {
        this.recognitionPollTimer = window.setTimeout(() => {
          this.recognitionPollTimer = null;
          this.tryStartSpeechRecognitionLoop();
        }, 350);
        return;
      }

      this.recognitionPollTimer = null;
      try {
        this.recognition.start();
      } catch {
        this.recognitionKickTimer = window.setTimeout(() => {
          this.recognitionKickTimer = null;
          this.tryStartSpeechRecognitionLoop();
        }, 500);
      }
    }
  
    private initSpeechRecognition(): void {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
      if (!SpeechRecognition) {
        console.warn("[SpeechAnalyzer] Web Speech API not available — transcription disabled");
        return;
      }
  
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang =
        typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
      this.recognition.maxAlternatives = 1;
  
      this.recognition.onresult = (event: any) => {
        this.handleSpeechResult(event);
      };
  
      this.recognition.onspeechstart = () => {
        this.currentSegmentStart = performance.now() - this.startTime;
        if (this.inSilence && this.lastSpeechEndMs > 0) {
          const gap: SilenceGap = {
            startMs: this.lastSpeechEndMs,
            endMs: this.currentSegmentStart,
            durationMs: this.currentSegmentStart - this.lastSpeechEndMs,
          };
          this.silenceGaps.push(gap);
        }
        this.inSilence = false;
      };
  
      this.recognition.onspeechend = () => {
        this.lastSpeechEndMs = performance.now() - this.startTime;
        this.inSilence = true;
      };
  
      this.recognition.onend = () => {
        if (this.running) {
          this.scheduleRecognitionRestart();
        }
      };
  
      this.recognition.onerror = (event: any) => {
        const err = event.error as string;
        if (!this.running) return;

        if (err === "aborted") {
          return;
        }

        if (err === "not-allowed" || err === "service-not-allowed") {
          console.warn("[SpeechAnalyzer] Web Speech permission / service blocked:", err);
          return;
        }

        if (
          err === "no-speech" ||
          err === "network" ||
          err === "audio-capture" ||
          err === "bad-grammar" ||
          err === "language-not-supported"
        ) {
          this.scheduleRecognitionRestart();
        }
      };

      this.clearRecognitionTimers();
      this.recognitionKickTimer = window.setTimeout(() => {
        this.recognitionKickTimer = null;
        this.tryStartSpeechRecognitionLoop();
      }, 320);
    }
  
    private handleSpeechResult(event: any): void {
      let finalText = "";
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
          finalText += transcript + " ";
          confidence = Math.max(confidence, result[0].confidence ?? 0.8);
        }
      }

      let runningInterim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          runningInterim += event.results[i][0].transcript;
        }
      }
      this.latestInterimTranscript = runningInterim.trim();

      if (finalText.trim()) {
        const now = performance.now() - this.startTime;
        const durationMs = now - this.currentSegmentStart;
        const words = this.tokenize(finalText);
        const fillerData = this.detectFillers(words);
        const wpm = durationMs > 0 ? (words.length / durationMs) * 60_000 : 0;
  
        const segment: SpeechSegment = {
          startMs: this.currentSegmentStart,
          endMs: now,
          text: finalText.trim(),
          wordCount: words.length,
          wpm: Math.round(wpm),
          fillerCount: fillerData.count,
          fillerWords: fillerData.words,
          confidence,
          isFinal: true,
        };
  
        this.segments.push(segment);

        // Accumulate filler counts
        for (const w of fillerData.words) {
          this.fillerWordCounts[w] = (this.fillerWordCounts[w] ?? 0) + 1;
        }

        this.currentSegmentStart = now;
        this.latestInterimTranscript = "";
      }
    }
  
    // ── Filler word detection ─────────────────────────────────────────────────
    //
    // We check both single words and 2-grams (e.g. "you know", "so yeah")
  
    private detectFillers(words: string[]): { count: number; words: string[] } {
      const found: string[] = [];
  
      for (let i = 0; i < words.length; i++) {
        const w1 = words[i].toLowerCase();
        const bigram = i < words.length - 1
          ? `${w1} ${words[i + 1].toLowerCase()}`
          : null;
  
        if (bigram && FILLER_WORDS.has(bigram)) {
          found.push(bigram);
          i++; // skip next word
        } else if (FILLER_WORDS.has(w1)) {
          found.push(w1);
        }
      }
  
      return { count: found.length, words: found };
    }
  
    private tokenize(text: string): string[] {
      return text.split(/\s+/).filter(w => w.length > 0);
    }
  
    // ── Report building ───────────────────────────────────────────────────────
  
    private buildReport(): SpeechReport {
      const sessionDurationMs = performance.now() - this.startTime;
  
      const totalWords = this.segments.reduce((s, seg) => s + seg.wordCount, 0);
      const speakingTimeMs = this.segments.reduce((s, seg) => s + (seg.endMs - seg.startMs), 0);
      const avgWpm = speakingTimeMs > 0 ? (totalWords / speakingTimeMs) * 60_000 : 0;
      const wpms = this.segments.map(s => s.wpm).filter(w => w > 0);
      const maxWpm = Math.max(...wpms, 0);
      const minWpm = Math.min(...wpms, 999);
  
      const totalFillers = Object.values(this.fillerWordCounts).reduce((a, b) => a + b, 0);
      const speakingMinutes = speakingTimeMs / 60_000;
      const fillersPerMinute = speakingMinutes > 0 ? totalFillers / speakingMinutes : 0;
  
      const deadPauses = this.silenceGaps.filter(g => g.durationMs >= DEAD_PAUSE_THRESHOLD_MS);
      const longestSilenceMs = Math.max(...this.silenceGaps.map(g => g.durationMs), 0);
  
      const avgNoiseFloor = this.audioSnapshots.reduce((a, s) => a + s.noiseFloorDb, 0) /
                            (this.audioSnapshots.length || 1);
      const avgSnr = this.audioSnapshots.reduce((a, s) => a + s.snrDb, 0) /
                     (this.audioSnapshots.length || 1);
      const avgConf = this.segments.reduce((a, s) => a + s.confidence, 0) /
                      (this.segments.length || 1);
  
      const topFillers = Object.entries(this.fillerWordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word, count]) => ({ word, count }));
  
      const fullTranscript = this.segments.map(s => s.text).join(" ");
  
      // Scores
      const paceScore         = this.scorePace(avgWpm);
      const fillerScore       = this.scoreFillers(fillersPerMinute);
      const silenceScore      = this.scoreSilence(deadPauses.length, longestSilenceMs);
      const audioScore        = this.scoreAudio(avgSnr, avgConf * 100);
      const overall = paceScore * 0.25 + fillerScore * 0.3 + silenceScore * 0.25 + audioScore * 0.2;
  
      return {
        sessionDurationMs,
        segments: this.segments,
        silenceGaps: this.silenceGaps,
        audioQualitySnapshots: this.audioSnapshots,
        fillerWordCounts: this.fillerWordCounts,
        topFillers,
        stats: {
          totalWords,
          speakingTimeMs,
          avgWpm: Math.round(avgWpm),
          maxWpm,
          minWpm,
          fillersPerMinute: Math.round(fillersPerMinute * 10) / 10,
          deadPauseCount: deadPauses.length,
          longestSilenceMs,
          avgNoiseFloorDb: Math.round(avgNoiseFloor * 10) / 10,
          avgSnrDb: Math.round(avgSnr * 10) / 10,
          transcriptionConfidence: Math.round(avgConf * 100),
        },
        scores: {
          pace:          Math.round(paceScore),
          fillerDensity: Math.round(fillerScore),
          silenceControl: Math.round(silenceScore),
          audioClarity:  Math.round(audioScore),
          overall:       Math.round(overall),
        },
        fullTranscript,
      };
    }
  
    // ── Scoring ───────────────────────────────────────────────────────────────
  
    private scorePace(avgWpm: number): number {
      if (avgWpm === 0) return 50;
      if (avgWpm >= IDEAL_WPM_LOW && avgWpm <= IDEAL_WPM_HIGH) return 100;
      if (avgWpm < IDEAL_WPM_LOW) {
        // Too slow — linear decay below 80 WPM
        return Math.max(30, 100 - (IDEAL_WPM_LOW - avgWpm) * 1.5);
      }
      // Too fast — steeper penalty
      return Math.max(20, 100 - (avgWpm - IDEAL_WPM_HIGH) * 2);
    }
  
    private scoreFillers(perMinute: number): number {
      if (perMinute <= 1)  return 100;
      if (perMinute <= 2)  return 90;
      if (perMinute <= 4)  return 75;
      if (perMinute <= 7)  return 55;
      if (perMinute <= 10) return 35;
      return 15;
    }
  
    private scoreSilence(deadPauseCount: number, longestMs: number): number {
      let s = 100;
      s -= deadPauseCount * 15;                     // -15 per dead pause
      if (longestMs > 15_000) s -= 20;              // extra penalty for very long pause
      else if (longestMs > 8_000) s -= 8;
      return Math.max(10, s);
    }
  
    private scoreAudio(avgSnr: number, transcriptionConf: number): number {
      // SNR: >20dB = excellent, 10–20 = ok, <10 = poor
      let snrScore = avgSnr >= 20 ? 100 : avgSnr >= 10 ? 70 : 40;
      let confScore = transcriptionConf;
      return snrScore * 0.5 + confScore * 0.5;
    }
  }