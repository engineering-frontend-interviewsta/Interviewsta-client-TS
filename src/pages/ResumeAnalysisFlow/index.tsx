import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitResumeForAnalysis } from '../../services/resumeService';
import type { ResumeAnalysisResult } from '../../services/resumeService';
import { ROUTES } from '../../constants/routerConstants';
import { Upload } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
        <p className="text-gray-600 mb-6">
          Upload your resume to get AI-powered feedback and job-fit insights.
        </p>
        {!result ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <label className="block">
                  <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                    Choose file
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing…' : 'Analyze resume'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Results</h2>
              {result.overall_score != null && (
                <p className="text-2xl font-bold text-blue-600 mb-4">{result.overall_score}% overall</p>
              )}
              {result.job_match_score != null && (
                <p className="text-gray-600 mb-4">Job match: {result.job_match_score}%</p>
              )}
              {result.strengths && result.strengths.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Strengths</h3>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.weaknesses && result.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Areas to improve</h3>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
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
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
            >
              Analyze another
            </button>
          </div>
        )}
        <Link to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline block mt-6">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
