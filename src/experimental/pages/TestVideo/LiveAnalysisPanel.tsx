import type { ReactNode } from 'react';
import type { LiveMeasurements } from '../../types/liveMeasurements';
import type { VideoTelemetryIntervalDebugEntry } from '../../hooks/useInterviewAnalysis';
import { VIDEO_TELEMETRY_INTERVAL_MS } from '../../../utils/videoTelemetryPayload';

function AnalysisRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li>
      <span>{label}</span>
      <span>{value}</span>
    </li>
  );
}

export interface LiveAnalysisPanelProps {
  liveMeasurements: LiveMeasurements;
  isRunning: boolean;
  error: string | null;
  /** Experimental: 20s telemetry batches (currInt segment arrays) from `useInterviewAnalysis`. */
  telemetryIntervalDebug?: VideoTelemetryIntervalDebugEntry[];
}

export function LiveAnalysisPanel({
  liveMeasurements,
  isRunning,
  error,
  telemetryIntervalDebug,
}: LiveAnalysisPanelProps) {
  return (
    <div className="interview-interface__card test-video-analysis-card">
      <div className="interview-interface__card-header">
        <h2 className="interview-interface__card-title">Live analysis</h2>
        <div className="interview-interface__card-meta">
          <span>{isRunning ? 'active' : 'idle'}</span>
        </div>
      </div>
      {error && (
        <p className="test-video-analysis-card__error" role="alert">
          {error}
        </p>
      )}
      <div className="test-video-analysis-card__scroll">
        <section className="test-video-analysis-card__section">
          <h3 className="test-video-analysis-card__heading">Presence (face + pose)</h3>
          <ul className="test-video-analysis-card__stats">
            <AnalysisRow
              label="MediaPipe samples"
              value={
                liveMeasurements.presence.hasSamples
                  ? `${liveMeasurements.presence.snapshotCount} frames`
                  : 'waiting (~10s after start)'
              }
            />
            <AnalysisRow label="Gaze direction" value={liveMeasurements.presence.gazeDirection} />
            <AnalysisRow
              label="Gaze confidence"
              value={liveMeasurements.presence.gazeConfidence.toFixed(2)}
            />
            <AnalysisRow
              label="Head yaw / pitch / roll"
              value={`${liveMeasurements.presence.headYawDeg.toFixed(0)}° / ${liveMeasurements.presence.headPitchDeg.toFixed(0)}° / ${liveMeasurements.presence.headRollDeg.toFixed(0)}°`}
            />
            <AnalysisRow
              label="Spine angle"
              value={`${liveMeasurements.presence.spineAngleDeg.toFixed(1)}°`}
            />
            <AnalysisRow
              label="Slouching"
              value={liveMeasurements.presence.isSlouching ? 'yes' : 'no'}
            />
            <AnalysisRow
              label="Stress (brow / lip / jaw / overall)"
              value={`${liveMeasurements.presence.browRaise.toFixed(2)} / ${liveMeasurements.presence.lipCompression.toFixed(2)} / ${liveMeasurements.presence.jawTension.toFixed(2)} / ${liveMeasurements.presence.overallStress.toFixed(2)}`}
            />
            <AnalysisRow
              label="Fidget: face / hair touches"
              value={`${liveMeasurements.presence.faceTouchCount} / ${liveMeasurements.presence.hairTouchCount}`}
            />
          </ul>
        </section>

        <section className="test-video-analysis-card__section">
          <h3 className="test-video-analysis-card__heading">Speech (audio + STT)</h3>
          <ul className="test-video-analysis-card__stats">
            <AnalysisRow
              label="Web Speech API"
              value={liveMeasurements.speech.webSpeechActive ? 'on' : 'off (browser may not support)'}
            />
            <AnalysisRow label="Segments" value={liveMeasurements.speech.segmentCount} />
            <AnalysisRow label="Total words (STT)" value={liveMeasurements.speech.totalWords} />
            <AnalysisRow label="Current segment WPM" value={Math.round(liveMeasurements.speech.currentWpm)} />
            <AnalysisRow label="Filler words (session)" value={liveMeasurements.speech.fillerCount} />
            <AnalysisRow
              label="Speaking time (session)"
              value={`${Math.round(liveMeasurements.speech.speakingTimeMs / 1000)}s`}
            />
            <AnalysisRow label="RMS level" value={`${liveMeasurements.speech.rmsDb.toFixed(1)} dBFS`} />
            <AnalysisRow label="SNR" value={`${liveMeasurements.speech.snrDb.toFixed(1)} dB`} />
            <AnalysisRow
              label="Noise floor (est.)"
              value={`${liveMeasurements.speech.noiseFloorDb.toFixed(0)} dB`}
            />
            <AnalysisRow label="Clipping" value={liveMeasurements.speech.clipping ? 'yes' : 'no'} />
            <li className="test-video-analysis-card__stats-row--block">
              <span>Latest STT text</span>
              <span className="test-video-analysis-card__multiline">
                {liveMeasurements.speech.latestSegmentText || '—'}
              </span>
            </li>
          </ul>
        </section>

        {telemetryIntervalDebug != null ? (
          <section className="test-video-analysis-card__section">
            <h3 className="test-video-analysis-card__heading">
              Telemetry interval ({Math.round(VIDEO_TELEMETRY_INTERVAL_MS / 1000)}s batches)
            </h3>
            <p className="test-video-analysis-card__pending test-video-analysis-card__telemetry-intro">
              Each row is one tick: new finals, else interim, else 1s <code>currentWpm</code> samples
              while the mic looks active (when the segment cursor is already caught up). POSTed{' '}
              <code>speech.currInt*</code> matches this.
            </p>
            {telemetryIntervalDebug.length === 0 ? (
              <p className="test-video-analysis-card__pending">
                {isRunning
                  ? 'Waiting for first interval…'
                  : 'Start analysis to record intervals.'}
              </p>
            ) : (
              <ul className="test-video-analysis-card__telemetry-log">
                {telemetryIntervalDebug.map((e, i) => (
                  <li key={`${e.tickAtMs}-${i}`} className="test-video-analysis-card__telemetry-entry">
                    <div className="test-video-analysis-card__telemetry-entry-meta">
                      <span>
                        #{i + 1} · ~{e.payloadDurationSec}s elapsed
                      </span>
                      <span className="test-video-analysis-card__telemetry-posted">
                        {e.postedToApi ? 'POST' : 'local only'}
                      </span>
                    </div>
                    <div className="test-video-analysis-card__telemetry-entry-row">
                      <span className="test-video-analysis-card__telemetry-k">segment cursor</span>
                      <span className="test-video-analysis-card__telemetry-v">
                        [{e.fromSegmentIndex} → {e.toSegmentIndexExclusive})
                      </span>
                    </div>
                    <div className="test-video-analysis-card__telemetry-entry-row">
                      <span className="test-video-analysis-card__telemetry-k">currInt source</span>
                      <span className="test-video-analysis-card__telemetry-v">
                        {e.currIntSource ?? '—'}
                        {e.liveWpmSampleSeconds != null
                          ? ` · ${e.liveWpmSampleSeconds}s WPM samples`
                          : ''}
                      </span>
                    </div>
                    <div className="test-video-analysis-card__telemetry-entry-row">
                      <span className="test-video-analysis-card__telemetry-k">currIntSegmentCounts</span>
                      <span className="test-video-analysis-card__telemetry-v">{e.currIntSegmentCounts}</span>
                    </div>
                    <div className="test-video-analysis-card__telemetry-entry-row">
                      <span className="test-video-analysis-card__telemetry-k">currIntSegmentWpm</span>
                      <span className="test-video-analysis-card__telemetry-v">
                        [{e.currIntSegmentWpm.join(', ') || ' '}]
                      </span>
                    </div>
                    <div className="test-video-analysis-card__telemetry-entry-row">
                      <span className="test-video-analysis-card__telemetry-k">currIntSegmentWords</span>
                      <span className="test-video-analysis-card__telemetry-v">
                        [{e.currIntSegmentWords.join(', ') || ' '}]
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <section className="test-video-analysis-card__section">
          <h3 className="test-video-analysis-card__heading">Environment (snapshot)</h3>
          {!liveMeasurements.environment ? (
            <p className="test-video-analysis-card__pending">
              After MediaPipe starts (~10s), we sample lighting, camera, background, attire, and room audio
              using live face/pose landmarks. The first full report usually appears ~15–20s from start.
            </p>
          ) : (
            <ul className="test-video-analysis-card__stats">
              <AnalysisRow
                label="Overall score"
                value={`${liveMeasurements.environment.overallScore}/100`}
              />
              <AnalysisRow
                label="Lighting"
                value={`${liveMeasurements.environment.lighting.verdict} (${liveMeasurements.environment.lighting.score}) · frame ${Math.round(liveMeasurements.environment.lighting.avgBrightness)} · face ${Math.round(liveMeasurements.environment.lighting.faceBrightness)} · bg ${Math.round(liveMeasurements.environment.lighting.backgroundBrightness)} · contrast ${liveMeasurements.environment.lighting.contrastRatio.toFixed(2)} · ${liveMeasurements.environment.lighting.colorTemperature} · backlight ${liveMeasurements.environment.lighting.backlightDetected ? 'yes' : 'no'}`}
              />
              <AnalysisRow
                label="Camera angle"
                value={`${liveMeasurements.environment.camera.verdict} (${liveMeasurements.environment.camera.score}) · est. ${liveMeasurements.environment.camera.estimatedAngleDeg.toFixed(1)}° · face span ${(liveMeasurements.environment.camera.faceVerticalSpan * 100).toFixed(0)}% · forehead/chin y ${liveMeasurements.environment.camera.foreheadYNorm.toFixed(2)} / ${liveMeasurements.environment.camera.chinYNorm.toFixed(2)} · below eye level ${liveMeasurements.environment.camera.isAboveEyeLevel ? 'yes' : 'no'}`}
              />
              <AnalysisRow
                label="Background"
                value={`${liveMeasurements.environment.background.verdict} (${liveMeasurements.environment.background.score}) · edges ${liveMeasurements.environment.background.edgeDensity.toFixed(2)} · motion ${liveMeasurements.environment.background.motionScore.toFixed(2)} · uniform ${liveMeasurements.environment.background.isUniform ? 'yes' : 'no'} · RGB ${liveMeasurements.environment.background.dominantBgColor ? liveMeasurements.environment.background.dominantBgColor.join(',') : '—'}`}
              />
              <AnalysisRow
                label="Attire (torso sample)"
                value={`${liveMeasurements.environment.attire.verdict} (${liveMeasurements.environment.attire.score}) · class ${liveMeasurements.environment.attire.colorClass} · RGB ${liveMeasurements.environment.attire.dominantRgb.join(',')} · HSL ${liveMeasurements.environment.attire.dominantHsl.join('/')} · moiré risk ${liveMeasurements.environment.attire.moireRisk ? 'yes' : 'no'} · ~${liveMeasurements.environment.attire.torsoPixelCount} px`}
              />
              <AnalysisRow
                label="Room audio"
                value={`${liveMeasurements.environment.audio.verdict} (${liveMeasurements.environment.audio.score}) · floor ${liveMeasurements.environment.audio.noiseFloorDb.toFixed(0)} dB · peak ${liveMeasurements.environment.audio.peakDb.toFixed(0)} dB · flatness ${liveMeasurements.environment.audio.spectralFlatness.toFixed(3)} · bg noise ${liveMeasurements.environment.audio.hasBackgroundNoise ? 'yes' : 'no'} · events ${liveMeasurements.environment.audio.externalEventCount} · echo ${liveMeasurements.environment.audio.echoDetected ? 'yes' : 'no'}`}
              />
              {liveMeasurements.environment.lighting.issue ? (
                <AnalysisRow label="Lighting note" value={liveMeasurements.environment.lighting.issue} />
              ) : null}
              {liveMeasurements.environment.camera.issue ? (
                <AnalysisRow label="Camera note" value={liveMeasurements.environment.camera.issue} />
              ) : null}
              {liveMeasurements.environment.background.issue ? (
                <AnalysisRow label="Background note" value={liveMeasurements.environment.background.issue} />
              ) : null}
              {liveMeasurements.environment.attire.issue ? (
                <AnalysisRow label="Attire note" value={liveMeasurements.environment.attire.issue} />
              ) : null}
              {liveMeasurements.environment.attire.suggestion ? (
                <AnalysisRow label="Attire suggestion" value={liveMeasurements.environment.attire.suggestion} />
              ) : null}
              {liveMeasurements.environment.audio.issue ? (
                <AnalysisRow label="Audio note" value={liveMeasurements.environment.audio.issue} />
              ) : null}
              {liveMeasurements.environment.criticalIssues.length > 0 ? (
                <li className="test-video-analysis-card__stats-row--block">
                  <span>Critical issues</span>
                  <span className="test-video-analysis-card__multiline">
                    {liveMeasurements.environment.criticalIssues.join(' · ')}
                  </span>
                </li>
              ) : null}
              {liveMeasurements.environment.suggestions.length > 0 ? (
                <li className="test-video-analysis-card__stats-row--block">
                  <span>Suggestions</span>
                  <span className="test-video-analysis-card__multiline">
                    {liveMeasurements.environment.suggestions.join(' · ')}
                  </span>
                </li>
              ) : null}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
