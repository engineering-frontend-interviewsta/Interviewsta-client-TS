import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSpeechCaptureResult {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useSpeechCapture(
  onAudioReady: (audio: Blob) => Promise<void> | void
): UseSpeechCaptureResult {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    };
  }, []);

  const startRecording = useCallback(() => {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            await onAudioReady(blob);
          }
          chunksRef.current = [];
          stream.getTracks().forEach((t) => t.stop());
          mediaRecorderRef.current = null;
        };
        recorder.start();
        setIsRecording(true);
      })
      .catch(() => {
        // ignore; user may have denied mic
      });
  }, [isRecording, onAudioReady]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}

