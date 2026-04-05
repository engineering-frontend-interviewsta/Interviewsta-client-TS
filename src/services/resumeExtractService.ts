import { nestClient } from '../api/axiosInstance';

/** POST /resume/extract-text — PDF only, requires auth. */
export async function extractResumePdfText(file: File): Promise<{ text: string; truncated: boolean }> {
  const body = new FormData();
  body.append('file', file);
  const res = await nestClient.post<{ text: string; truncated: boolean }>('resume/extract-text', body);
  return res.data;
}

export type TailoredInterviewContextResult = {
  resumeText: string;
  resumeTruncated: boolean;
  jobTitle: string | null;
  jobDescription: string | null;
  jobDescriptionTruncated: boolean;
};

/**
 * POST /resume/tailored-interview-context — resume PDF required; at least one of job title,
 * pasted JD, or JD PDF.
 */
export async function postTailoredInterviewContext(params: {
  resumeFile: File;
  jobTitle: string;
  jobDescription: string;
  jobDescriptionFile: File | null;
}): Promise<TailoredInterviewContextResult> {
  const body = new FormData();
  body.append('resume', params.resumeFile);
  if (params.jobTitle.trim()) {
    body.append('jobTitle', params.jobTitle.trim());
  }
  if (params.jobDescription.trim()) {
    body.append('jobDescription', params.jobDescription.trim());
  }
  if (params.jobDescriptionFile) {
    body.append('jobDescriptionFile', params.jobDescriptionFile);
  }
  const res = await nestClient.post<TailoredInterviewContextResult>('resume/tailored-interview-context', body);
  return res.data;
}
