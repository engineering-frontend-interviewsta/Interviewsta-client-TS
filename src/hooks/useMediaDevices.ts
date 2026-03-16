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
  streamReady: boolean;
  getStream: () => Promise<MediaStream>;
}

function createStreamPromise(): {
  resolve: (s: MediaStream) => void;
  reject: (e: Error) => void;
  promise: Promise<MediaStream>;
} {
  let resolve!: (s: MediaStream) => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<MediaStream>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise };
}

export function useMediaDevices(): UseMediaDevicesResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const streamReadyRef = useRef(createStreamPromise());
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

        // ✅ Resolve the promise HERE, inside setup(), where stream is defined
        streamReadyRef.current?.resolve(stream);
        setStreamReady(true);

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
          setState((prev) => ({ ...prev, micLevel: Math.min(1, rms / 50) }));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to access camera or microphone.';
        // ✅ Also reject the promise on failure so callers don't hang forever
        streamReadyRef.current?.reject(new Error(msg));
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
    stream.getVideoTracks().forEach((t) => { t.enabled = enabled; });
    setState((prev) => ({ ...prev, videoEnabled: enabled }));
  }, [state.videoEnabled]);

  const toggleAudio = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const enabled = !state.audioEnabled;
    stream.getAudioTracks().forEach((t) => { t.enabled = enabled; });
    setState((prev) => ({ ...prev, audioEnabled: enabled }));
  }, [state.audioEnabled]);

  // ✅ getStream returns the stable promise — resolves whenever stream is ready
  const getStream = useCallback(() => streamReadyRef.current!.promise, []);

  return {
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    ...state,
    toggleVideo,
    toggleAudio,
    streamReady,
    getStream,
  };
}
