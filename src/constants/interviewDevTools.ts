/**
 * Dev-only interview tools (text-only flow, skip TTS). Hidden in production builds
 * unless VITE_ENABLE_INTERVIEW_DEV_TOOLS is set to "true".
 */
export const interviewDevToolsBuildVisible =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_INTERVIEW_DEV_TOOLS === 'true';

/** True when the signed-in user has the `developer` role and the build allows dev tools. */
export function interviewDevToolsAllowedForUser(roles: string[] | null | undefined): boolean {
  return interviewDevToolsBuildVisible && Boolean(roles?.includes('developer'));
}
