/**
 * Convert a recorded audio Blob (e.g. webm/opus from MediaRecorder) to WAV base64
 * with RIFF header so the backend STT accepts it.
 */
const TARGET_SAMPLE_RATE = 16000;

export async function blobToWavBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new Ctx();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  const channel =
    audioBuffer.numberOfChannels > 0 ? audioBuffer.getChannelData(0) : new Float32Array(0);
  const sourceRate = audioBuffer.sampleRate;
  let float32 = channel;
  if (sourceRate !== TARGET_SAMPLE_RATE) {
    const ratio = sourceRate / TARGET_SAMPLE_RATE;
    const newLength = Math.round(channel.length / ratio);
    float32 = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const idx = Math.floor(srcIndex);
      const frac = srcIndex - idx;
      const next = Math.min(idx + 1, channel.length - 1);
      float32[i] = channel[idx] * (1 - frac) + channel[next] * frac;
    }
  }
  const numSamples = float32.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_SAMPLE_RATE, true);
  view.setUint32(28, TARGET_SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  const wavBlob = new Blob([buffer], { type: 'audio/wav' });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res === 'string') {
        const commaIndex = res.indexOf(',');
        resolve(commaIndex >= 0 ? res.slice(commaIndex + 1) : res);
      } else {
        reject(new Error('Failed to read WAV'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read WAV'));
    reader.readAsDataURL(wavBlob);
  });
}

export { TARGET_SAMPLE_RATE };
