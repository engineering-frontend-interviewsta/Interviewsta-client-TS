const STORAGE_KEY = 'interviewsta_use_sarvam_audio';

export function getUseSarvamAudio(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setUseSarvamAudio(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    /* ignore quota / private mode */
  }
}
