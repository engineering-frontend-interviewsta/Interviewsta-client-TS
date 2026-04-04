/**
 * Dev-only interview tools (text-only flow, skip TTS). Hidden in production builds
 * unless VITE_ENABLE_INTERVIEW_DEV_TOOLS is set to "true".
 */
export const interviewDevToolsVisible =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_INTERVIEW_DEV_TOOLS === 'true';
