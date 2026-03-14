import { useCallback, useEffect, useRef, useState } from 'react';

export interface MediaState {
  videoEnabled: boolean;
  audioEnabled: boolean;
  micLevel: number;
  error: string | null;
}

export interface UseMediaDevicesResult extends MediaState {
  videoRef: React.RefObject<HTMLVideoElement>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  /** Returns a Promise that resolves with the microphone stream when ready (for VAD). */
  getStream: () => Promise<MediaStream>;
}

export function useMediaDevices(): UseMediaDevicesResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const [state, setState] = useState<MediaState>({
    videoEnabled: true,
    audioEnabled: true,
    micLevel: 0,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        audioAnalyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!mounted || !audioAnalyserRef.current) return;
          audioAnalyserRef.current.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i += 1) {
            const v = dataArray[i] - 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const level = Math.min(1, rms / 50);
          setState((prev) => ({ ...prev, micLevel: level }));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to access camera or microphone.';
        setState((prev) => ({ ...prev, error: msg, videoEnabled: false, audioEnabled: false }));
      }
    };

    void setup();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioAnalyserRef.current) {
        audioAnalyserRef.current.disconnect();
        audioAnalyserRef.current = null;
      }
    };
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const enabled = !state.videoEnabled;
    stream.getVideoTracks().forEach((t) => {
      // eslint-disable-next-line no-param-reassign
      t.enabled = enabled;
    });
    setState((prev) => ({ ...prev, videoEnabled: enabled }));
  }, [state.videoEnabled]);

  const toggleAudio = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const enabled = !state.audioEnabled;
    stream.getAudioTracks().forEach((t) => {
      // eslint-disable-next-line no-param-reassign
      t.enabled = enabled;
    });
    setState((prev) => ({ ...prev, audioEnabled: enabled }));
  }, [state.audioEnabled]);

  const getStream = useCallback(async (): Promise<MediaStream> => {
    if (streamRef.current) return streamRef.current;
    // Wait for async setup to assign the stream (a few ticks)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 50));
      if (streamRef.current) return streamRef.current;
    }
    throw new Error('Microphone not ready');
  }, []);

  return {
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    ...state,
    toggleVideo,
    toggleAudio,
    getStream,
  };
}

