/**
 * Reads payload from the Nest interview access JWT (no signature verify — same as typical client JWT reads).
 */
export interface InterviewAccessJwtPayload {
  isFreeInterview?: boolean;
}

function base64UrlToJson(part: string): Record<string, unknown> {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const base64 = pad ? padded + '='.repeat(4 - pad) : padded;
  const json = atob(base64);
  return JSON.parse(json) as Record<string, unknown>;
}

export function decodeInterviewAccessPayload(token: string): InterviewAccessJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const p = base64UrlToJson(parts[1]);
    return {
      isFreeInterview: p.isFreeInterview === true,
    };
  } catch {
    return null;
  }
}
