import { useEffect, useState } from 'react';

/**
 * Keeps "user is speaking" true briefly after VAD drops to false so short silence
 * gaps inside one utterance don't flip the UI back to "your turn".
 */
export function useUtteranceHold(userSpeaking: boolean, holdMs = 480): boolean {
  const [gapHold, setGapHold] = useState(false);

  useEffect(() => {
    if (userSpeaking) {
      setGapHold(true);
      return;
    }
    const id = window.setTimeout(() => setGapHold(false), holdMs);
    return () => window.clearTimeout(id);
  }, [userSpeaking, holdMs]);

  return userSpeaking || gapHold;
}
