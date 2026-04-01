import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Video, Mic, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import './InterviewStartGateModal.css';

interface InterviewStartGateModalProps {
  isOpen: boolean;
  interviewTitle: string;
  onClose: () => void;
  /** Called after camera and microphone access succeeds; tracks are stopped before this runs. */
  onGranted: () => void;
}

export default function InterviewStartGateModal({
  isOpen,
  interviewTitle,
  onClose,
  onGranted,
}: InterviewStartGateModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const el = videoRef.current;
    if (el) el.srcObject = null;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanupStream();
      setChecking(false);
      setVerified(false);
      setError(null);
    }
  }, [isOpen, cleanupStream]);

  // Video is only mounted after `verified` is true, so attaching in getUserMedia left ref null.
  useEffect(() => {
    if (!verified || !isOpen) return;
    const stream = streamRef.current;
    const el = videoRef.current;
    if (!stream || !el) return;
    el.srcObject = stream;
    el.muted = true;
    el.playsInline = true;
    void el.play().catch(() => {});
    return () => {
      el.srcObject = null;
    };
  }, [verified, isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !checking) onClose();
  };

  const handleAllowAndContinue = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera or microphone access.');
      return;
    }
    setError(null);
    setChecking(true);
    setVerified(false);
    cleanupStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      if (videoTracks.length === 0 || audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        setError('Both camera and microphone are required to continue.');
        setChecking(false);
        return;
      }
      streamRef.current = stream;
      setVerified(true);
      setChecking(false);
    } catch (err) {
      setChecking(false);
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not access camera or microphone. Please allow access and try again.';
      setError(msg);
    }
  };

  const handleStartInterview = () => {
    cleanupStream();
    onGranted();
  };

  if (!isOpen) return null;

  return (
    <div
      className="interview-start-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-start-gate-title"
      onClick={handleBackdropClick}
    >
      <div className="interview-start-gate__panel">
        <div className="interview-start-gate__header">
          <div>
            <h2 id="interview-start-gate-title" className="interview-start-gate__title">
              Start this interview?
            </h2>
            <p className="interview-start-gate__subtitle">
              <span className="interview-start-gate__session-name">{interviewTitle}</span>
              Glee needs your camera and microphone for this video session. Allow access below, then
              we will prepare your room.
            </p>
          </div>
          <button
            type="button"
            className="interview-start-gate__close"
            onClick={onClose}
            disabled={checking}
            aria-label="Close"
          >
            <X aria-hidden />
          </button>
        </div>

        <div className="interview-start-gate__body">
          {!verified ? (
            <div className="interview-start-gate__checks" aria-hidden>
              <div className="interview-start-gate__check-row">
                <Video className="interview-start-gate__check-icon" />
                <span>Camera</span>
              </div>
              <div className="interview-start-gate__check-row">
                <Mic className="interview-start-gate__check-icon" />
                <span>Microphone</span>
              </div>
            </div>
          ) : (
            <div className="interview-start-gate__preview-wrap">
              <video
                ref={videoRef}
                className="interview-start-gate__preview"
                playsInline
                muted
                autoPlay
              />
              <div className="interview-start-gate__ok-banner" role="status">
                <CheckCircle2 aria-hidden className="interview-start-gate__ok-icon" />
                <span>Camera and microphone are on</span>
              </div>
            </div>
          )}

          {error && (
            <div className="interview-start-gate__error" role="alert">
              <AlertCircle aria-hidden className="interview-start-gate__error-icon" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="interview-start-gate__footer">
          {!verified ? (
            <>
              <button
                type="button"
                className="interview-start-gate__btn interview-start-gate__btn--secondary"
                onClick={onClose}
                disabled={checking}
              >
                Cancel
              </button>
              <button
                type="button"
                className="interview-start-gate__btn interview-start-gate__btn--primary"
                onClick={handleAllowAndContinue}
                disabled={checking}
              >
                {checking ? (
                  <>
                    <Loader2 className="interview-start-gate__btn-spinner" aria-hidden />
                    Checking access…
                  </>
                ) : (
                  'Allow camera & microphone'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="interview-start-gate__btn interview-start-gate__btn--secondary"
                onClick={() => {
                  cleanupStream();
                  setVerified(false);
                  setError(null);
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="interview-start-gate__btn interview-start-gate__btn--primary"
                onClick={handleStartInterview}
              >
                Start interview
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
