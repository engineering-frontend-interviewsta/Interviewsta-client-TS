import { useCallback, useRef, useState } from 'react';
import { X, FileText, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { postTailoredInterviewContext, type TailoredInterviewContextResult } from '../../../services/resumeExtractService';
import './InterviewStartGateModal.css';
import './TailoredInterviewContextModal.css';

export type TailoredInterviewContextPayload = TailoredInterviewContextResult;

interface TailoredInterviewContextModalProps {
  isOpen: boolean;
  interviewTitle: string;
  onClose: () => void;
  onContinue: (ctx: TailoredInterviewContextPayload) => void;
}

export default function TailoredInterviewContextModal({
  isOpen,
  interviewTitle,
  onClose,
  onContinue,
}: TailoredInterviewContextModalProps) {
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const reset = useCallback(() => {
    setBusy(false);
    setError(null);
    setResumeFile(null);
    setJdFile(null);
    setJobTitle('');
    setJobDescription('');
    if (resumeInputRef.current) resumeInputRef.current.value = '';
    if (jdFileInputRef.current) jdFileInputRef.current.value = '';
  }, []);

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const jobSignalOk =
    jobTitle.trim().length > 0 || jobDescription.trim().length > 0 || jdFile !== null;

  const canSubmit = Boolean(resumeFile) && jobSignalOk && !busy;

  const pickErr = (err: unknown): string => {
    const data =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: unknown } }).response?.data
        : undefined;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === 'string') return m;
      if (Array.isArray(m)) return m.join(' ');
    }
    return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    if (!resumeFile || !jobSignalOk) return;
    setError(null);
    setBusy(true);
    try {
      const ctx = await postTailoredInterviewContext({
        resumeFile,
        jobTitle,
        jobDescription,
        jobDescriptionFile: jdFile,
      });
      let resumeText = ctx.resumeText;
      if (ctx.resumeTruncated) {
        resumeText += '\n\n[Resume text was truncated for processing.]';
      }
      let jobDesc = ctx.jobDescription ?? '';
      if (ctx.jobDescriptionTruncated && jobDesc) {
        jobDesc += '\n\n[Job description was truncated for processing.]';
      }
      reset();
      onContinue({
        ...ctx,
        resumeText,
        jobDescription: jobDesc || null,
      });
    } catch (err) {
      setError(pickErr(err));
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="interview-start-gate tailored-context-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tailored-context-title"
      onClick={(e) => e.target === e.currentTarget && !busy && handleClose()}
    >
      <div className="interview-start-gate__panel tailored-context-modal__panel">
        <div className="interview-start-gate__header">
          <div>
            <h2 id="tailored-context-title" className="interview-start-gate__title">
              Resume & job you are applying for
            </h2>
            <p className="interview-start-gate__subtitle">
              <span className="interview-start-gate__session-name">{interviewTitle}</span>
              <strong>Resume (PDF) is required.</strong> Also provide{' '}
              <strong>at least one</strong> of: target job title, pasted job description, or job description PDF — so
              questions align with the role.
            </p>
          </div>
          <button
            type="button"
            className="interview-start-gate__close"
            onClick={handleClose}
            disabled={busy}
            aria-label="Close"
          >
            <X aria-hidden />
          </button>
        </div>

        <div className="interview-start-gate__body tailored-context-modal__body">
          <div className="tailored-context-modal__grid">
            {error && (
              <div className="interview-start-gate__error tailored-context-modal__full-span" role="alert">
                <AlertCircle aria-hidden className="interview-start-gate__error-icon" />
                <span>{error}</span>
              </div>
            )}
            <div className="tailored-context-modal__field">
              <label className="tailored-context-modal__label" htmlFor="tailored-resume-file">
                Resume PDF <span className="tailored-context-modal__req">*</span>
              </label>
              <input
                id="tailored-resume-file"
                ref={resumeInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="tailored-context-modal__file-input"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setResumeFile(f ?? null);
                }}
              />
              <p className="tailored-context-modal__file-hint">
                {resumeFile ? <strong>{resumeFile.name}</strong> : 'No file chosen'}
              </p>
            </div>

            <div className="tailored-context-modal__field">
              <label className="tailored-context-modal__label" htmlFor="tailored-job-title">
                <Briefcase className="tailored-context-modal__label-icon" aria-hidden />
                Target job title <span className="tailored-context-modal__opt">(optional if JD below)</span>
              </label>
              <input
                id="tailored-job-title"
                type="text"
                className="tailored-context-modal__text"
                placeholder="e.g. Senior Backend Engineer"
                value={jobTitle}
                disabled={busy}
                onChange={(e) => setJobTitle(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="tailored-context-modal__field tailored-context-modal__field--jd-text">
              <label className="tailored-context-modal__label" htmlFor="tailored-jd-text">
                Job description <span className="tailored-context-modal__opt">(paste text)</span>
              </label>
              <textarea
                id="tailored-jd-text"
                className="tailored-context-modal__textarea"
                placeholder="Paste the job posting or key requirements…"
                rows={3}
                value={jobDescription}
                disabled={busy}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="tailored-context-modal__field tailored-context-modal__field--jd-pdf">
              <label className="tailored-context-modal__label" htmlFor="tailored-jd-file">
                Job description PDF <span className="tailored-context-modal__opt">(or use paste)</span>
              </label>
              <input
                id="tailored-jd-file"
                ref={jdFileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="tailored-context-modal__file-input"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setJdFile(f ?? null);
                }}
              />
              <p className="tailored-context-modal__file-hint">
                {jdFile ? <strong>{jdFile.name}</strong> : 'No file chosen'}
              </p>
            </div>

            {!jobSignalOk ? (
              <p className="tailored-context-modal__hint-warn tailored-context-modal__full-span">
                Add a job title, paste a JD, or upload a JD PDF to continue.
              </p>
            ) : null}
          </div>
        </div>

        <div className="interview-start-gate__footer">
          <button
            type="button"
            className="interview-start-gate__btn interview-start-gate__btn--secondary"
            onClick={handleClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="interview-start-gate__btn interview-start-gate__btn--primary"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {busy ? (
              <>
                <Loader2 className="interview-start-gate__btn-spinner" aria-hidden />
                Preparing…
              </>
            ) : (
              <>
                <FileText style={{ width: '1rem', height: '1rem' }} aria-hidden />
                Continue to camera & mic
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
