import { djangoClient } from '../api/axiosInstance';
import { RESUME_APP_ENDPOINTS } from '../constants/apiEndpoints';

export interface ResumeAnalysisResult {
  overall_score?: number;
  job_match_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  sections?: unknown[];
  [key: string]: unknown;
}

/** Submit resume file for analysis (Django). */
export async function submitResumeForAnalysis(file: File): Promise<ResumeAnalysisResult> {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await djangoClient.post(RESUME_APP_ENDPOINTS.UPLOAD_ANALYSIS, formData);
  return (res.data ?? {}) as ResumeAnalysisResult;
}
