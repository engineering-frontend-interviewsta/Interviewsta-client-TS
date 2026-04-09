import { useState, useId, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { submitResumeForAnalysis, getResumeAnalysisErrorMessage } from '../../services/resumeService';
import { ROUTES } from '../../constants/routerConstants';
import AppStickyBackBar from '../../components/shared/AppStickyBackBar';
import './ResumeAnalysisFlow.css';

/** Stages shown while Nest → FastAPI/Celery runs (no granular server events; time-based UX). */
const ANALYSIS_STAGES = [
  { label: 'Uploading resume and job description…', progress: 12 },
  { label: 'Extracting text from your resume…', progress: 24 },
  { label: 'Analyzing sections and formatting…', progress: 38 },
  { label: 'Comparing skills to the job description…', progress: 52 },
  { label: 'Scoring keywords and job alignment…', progress: 66 },
  { label: 'Generating strengths and improvements…', progress: 80 },
  { label: 'Saving your analysis report…', progress: 92 },
] as const;

const STAGE_ADVANCE_MS = 14_000;

export default function ResumeAnalysisFlow() {
  const resumeInputId = useId();
  const jdInputId = useId();
  const navigate = useNavigate();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const stageIndexRef = useRef(0);

  /** Advance progress label + bar through pipeline stages while the request is in flight. */
  useEffect(() => {
    if (!loading) {
      stageIndexRef.current = 0;
      return;
    }

    const stages = ANALYSIS_STAGES;
    stageIndexRef.current = 0;
    setProgress(stages[0].progress);
    setProgressLabel(stages[0].label);

    const id = window.setInterval(() => {
      stageIndexRef.current += 1;
      const i = stageIndexRef.current;
      if (i < stages.length) {
        setProgress(stages[i].progress);
        setProgressLabel(stages[i].label);
      }
    }, STAGE_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeFile(e.target.files?.[0] ?? null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) { setError('Please select a resume file.'); return; }
    if (!jobDescription.trim()) { setError('Please paste the job description.'); return; }

    setError(null);
    setLoading(true);

    try {
      const sessionId = crypto.randomUUID();
      const data = await submitResumeForAnalysis({
        resumeFile,
        jobDescription: jobDescription.trim(),
        sessionId,
        resumeName: resumeFile.name,
      });

      setProgress(100);
      setProgressLabel('Analysis complete');

      const back = ROUTES.RESUME_ANALYSIS;
      if (data.analysisId) {
        const path = ROUTES.RESUME_FEEDBACK_HISTORY.replace(':analysisId', data.analysisId);
        navigate(path, {
          state: {
            type: 'resume-analysis',
            fileName: resumeFile.name,
            date: new Date().toISOString(),
            analysisResult: data,
            back,
          },
        });
      } else {
        navigate(ROUTES.FEEDBACK, {
          state: {
            type: 'resume-analysis',
            fileName: resumeFile.name,
            date: new Date().toISOString(),
            analysisResult: data,
            back,
          },
        });
      }
    } catch (err) {
      setError(getResumeAnalysisErrorMessage(err));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="resume-flow">
      <div className="resume-flow__inner">
        <AppStickyBackBar to={ROUTES.DASHBOARD}>Back to Dashboard</AppStickyBackBar>
        <h1 className="resume-flow__title">Resume Analysis</h1>
        <p className="resume-flow__subtitle">
          Upload your resume and paste the job description to get AI-powered feedback and job-fit insights.
        </p>

        {loading && (
          <div className="resume-flow__progress" aria-busy="true" aria-live="polite">
            <p className="resume-flow__progress-label">{progressLabel}</p>
            <div className="resume-flow__progress-bar-track">
              <div className="resume-flow__progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor={resumeInputId} className="resume-flow__field-label">
              Resume (PDF)
            </label>
            <div className="resume-flow__dropzone">
              <div className="resume-flow__dropzone-icon">
                <Upload aria-hidden />
              </div>
              <label htmlFor={resumeInputId} className="resume-flow__dropzone-label">
                Choose file
                <input
                  id={resumeInputId}
                  type="file"
                  accept=".pdf"
                  className="resume-flow__file-input"
                  onChange={handleFileChange}
                />
              </label>
              {resumeFile && (
                <p className="resume-flow__dropzone-file">{resumeFile.name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor={jdInputId} className="resume-flow__field-label">
              Job Description
            </label>
            <textarea
              id={jdInputId}
              className="resume-flow__textarea"
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="resume-flow__error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !resumeFile || !jobDescription.trim()}
            className="resume-flow__btn-primary"
          >
            {loading ? 'Analyzing…' : 'Analyze resume'}
          </button>
        </form>
      </div>
    </div>
  );
}
