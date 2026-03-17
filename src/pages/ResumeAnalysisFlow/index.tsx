import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitResumeForAnalysis } from '../../services/resumeService';
import type { ResumeAnalysisResult } from '../../services/resumeService';
import { ROUTES } from '../../constants/routerConstants';
import { Upload } from 'lucide-react';
import './ResumeAnalysisFlow.css';

export default function ResumeAnalysisFlow() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await submitResumeForAnalysis(file);
      setResult(data);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-flow">
      <div className="resume-flow__inner">
        <h1 className="resume-flow__title">Resume Analysis</h1>
        <p className="resume-flow__subtitle">
          Upload your resume to get AI-powered feedback and job-fit insights.
        </p>
        {!result ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="resume-flow__dropzone">
                <div className="resume-flow__dropzone-icon">
                  <Upload aria-hidden />
                </div>
                <label className="resume-flow__dropzone-label">
                  Choose file
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="resume-flow__file-input"
                    onChange={handleFileChange}
                  />
                </label>
                {file && <p className="resume-flow__dropzone-file">{file.name}</p>}
              </div>
              {error && <p className="resume-flow__error" role="alert">{error}</p>}
              <button type="submit" disabled={loading || !file} className="resume-flow__btn-primary">
                {loading ? 'Analyzing…' : 'Analyze resume'}
              </button>
            </form>
          </>
        ) : (
          <div>
            <div className="resume-flow__results">
              <h2 className="resume-flow__results-title">Results</h2>
              {result.overall_score != null && (
                <p className="resume-flow__results-score">{result.overall_score}% overall</p>
              )}
              {result.job_match_score != null && (
                <p className="resume-flow__results-meta">Job match: {result.job_match_score}%</p>
              )}
              {result.strengths && result.strengths.length > 0 && (
                <div className="resume-flow__results-section">
                  <h3 className="resume-flow__results-section-title">Strengths</h3>
                  <ul className="resume-flow__results-list">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.weaknesses && result.weaknesses.length > 0 && (
                <div className="resume-flow__results-section">
                  <h3 className="resume-flow__results-section-title">Areas to improve</h3>
                  <ul className="resume-flow__results-list">
                    {result.weaknesses.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setResult(null); setFile(null); }}
              className="resume-flow__btn-secondary"
            >
              Analyze another
            </button>
          </div>
        )}
        <Link to={ROUTES.DASHBOARD} className="resume-flow__back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
