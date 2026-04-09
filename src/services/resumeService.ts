import axios from 'axios';
import { nestClient } from '../api/axiosInstance';
import { RESUME_ENDPOINTS } from '../constants/apiEndpoints';
import { TIMEOUTS } from '../constants/appConstants';

export interface SectionScore {
  name: string;
  score: number;
  status: string;
}

export interface JobAlignment {
  requiredSkills: number;
  preferredSkills: number;
  experience: number;
  education: number;
  overall: number;
}

export interface KeywordsAnalysis {
  found: string[];
  missing: string[];
  jobSpecific: string[];
  score: number;
}

export interface ResumeAnalysisResult {
  sessionId: string;
  /** Original file name from upload / DB */
  resumeName?: string;
  overallScore: number;
  jobMatchScore: number;
  company: string;
  role?: string;
  /** DB row id when persisted; used for /resume-feedback/:analysisId */
  analysisId?: string;
  insights: string[];
  candidateStrength: string[];
  candidateAreasOfImprovements: string[];
  sections: SectionScore[];
  jobalignment: JobAlignment;
  keywords: KeywordsAnalysis;
}

/** Derive the status label from a 0-100 score (matches backend SCORING_BANDS). */
export function scoreStatusLabel(score: number): string {
  if (score >= 91) return 'outstanding';
  if (score >= 81) return 'excellent';
  if (score >= 71) return 'very-good';
  if (score >= 61) return 'good';
  if (score >= 51) return 'average';
  if (score >= 36) return 'below-average';
  return 'poor';
}

/** Reconstruct a ResumeAnalysisResult from a stored session row. */
export function buildAnalysisResultFromSession(item: {
  sessionId: string;
  overallScore: number;
  jobMatchScore: number;
  formatAndStructure: number;
  contentQuality: number;
  lengthAndConciseness: number;
  keywordsOptimization: number;
  atsScore: number;
  company?: string;
  role?: string;
  foundKeywords: string[];
  notFoundKeywords: string[];
  top3Keywords: string[];
  requiredSkills: number;
  preferredSkills: number;
  experience: number;
  education: number;
  insights: string[];
  candidateStrengths: string[];
  candidatesAreasOfImprovements: string[];
}): ResumeAnalysisResult {
  const sections: SectionScore[] = [
    { name: 'job_match_score', score: item.jobMatchScore, status: scoreStatusLabel(item.jobMatchScore) },
    { name: 'format_and_structure', score: item.formatAndStructure, status: scoreStatusLabel(item.formatAndStructure) },
    { name: 'content_quality', score: item.contentQuality, status: scoreStatusLabel(item.contentQuality) },
    { name: 'length_and_conciseness', score: item.lengthAndConciseness, status: scoreStatusLabel(item.lengthAndConciseness) },
    { name: 'keywords_optimization', score: item.keywordsOptimization, status: scoreStatusLabel(item.keywordsOptimization) },
    { name: 'ats_score', score: item.atsScore, status: scoreStatusLabel(item.atsScore) },
  ];
  return {
    sessionId: item.sessionId,
    overallScore: item.overallScore,
    jobMatchScore: item.jobMatchScore,
    company: item.company ?? '',
    role: item.role,
    insights: item.insights,
    candidateStrength: item.candidateStrengths,
    candidateAreasOfImprovements: item.candidatesAreasOfImprovements,
    sections,
    jobalignment: {
      requiredSkills: item.requiredSkills,
      preferredSkills: item.preferredSkills,
      experience: item.experience,
      education: item.education,
      overall: item.jobMatchScore,
    },
    keywords: {
      found: item.foundKeywords,
      missing: item.notFoundKeywords,
      jobSpecific: item.top3Keywords,
      score: item.keywordsOptimization,
    },
  };
}

export interface SubmitResumeParams {
  resumeFile: File;
  jobDescription: string;
  sessionId: string;
  resumeName?: string;
}

/** Maps axios / Nest errors to a user-visible string (403 credits, 503 FastAPI, timeouts, etc.). */
export function getResumeAnalysisErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      const m = Array.isArray(data.message) ? data.message.join(' ') : data.message;
      if (status === 403 && /credit/i.test(m)) {
        return `${m} You can add credits under Account → Billing & payments.`;
      }
      return m;
    }
    if (err.code === 'ECONNABORTED' || /timeout/i.test(String(err.message))) {
      return 'Request timed out. Resume analysis can take 1–2 minutes; ensure FastAPI and Celery are running, then try again.';
    }
    if (status === 504) {
      return 'Gateway timed out. The analysis may still be running on the server. Wait a minute and check your credits were not charged twice before retrying.';
    }
    if (status === 503) {
      return 'Resume analysis service is unavailable. Start the FastAPI app and set FASTAPI_BASE_URL on the backend, then retry.';
    }
    if (status === 500) {
      return 'Server error during resume analysis. Check that FastAPI, Celery (resume queue), and Redis are running.';
    }
    if (status === 401) {
      return 'Please sign in again to run resume analysis.';
    }
  }
  if (err instanceof Error) return err.message;
  return 'Analysis failed. Please try again.';
}

export async function getResumeAnalysisById(analysisId: string): Promise<ResumeAnalysisResult> {
  const res = await nestClient.get<ResumeAnalysisResult>(RESUME_ENDPOINTS.REPORT(analysisId));
  return res.data;
}

export async function submitResumeForAnalysis(
  params: SubmitResumeParams,
): Promise<ResumeAnalysisResult> {
  const { resumeFile, jobDescription, sessionId, resumeName } = params;

  const formData = new FormData();
  formData.append('Resume', resumeFile);
  formData.append('jobDescription', jobDescription);
  formData.append('sessionId', sessionId);
  formData.append('resumeName', resumeName ?? resumeFile.name);

  const res = await nestClient.post<ResumeAnalysisResult>(RESUME_ENDPOINTS.ANALYZE, formData, {
    timeout: TIMEOUTS.RESUME_ANALYSIS_MS,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    transformRequest: [
      (data, headers) => {
        if (typeof FormData !== 'undefined' && data instanceof FormData && headers) {
          if (typeof (headers as { delete?: (k: string) => void }).delete === 'function') {
            (headers as { delete: (k: string) => void }).delete('Content-Type');
          } else {
            delete (headers as Record<string, unknown>)['Content-Type'];
          }
        }
        return data;
      },
    ],
  });
  return res.data;
}
