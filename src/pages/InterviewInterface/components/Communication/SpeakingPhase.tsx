import { useState, useRef } from 'react';
import { Volume2, Mic, Square, Send } from 'lucide-react';
import { blobToWavBase64, TARGET_SAMPLE_RATE } from '../../../../utils/blobToWav';

export interface SpeakingPhaseProps {
  instruction?: string;
  paragraph?: string;
  onSendResponse: (payload: {
    textResponse?: string;
    audioData?: string;
    sampleRate?: number;
  }) => Promise<void>;
  isProcessing: boolean;
  feedback: string | null;
  onClearFeedback: () => void;
  /** Dev mode: submit typed text instead of recording the paragraph. */
  devMode?: boolean;
}

export default function SpeakingPhase({
  instruction,
  paragraph,
  onSendResponse,
  isProcessing,
  feedback,
  onClearFeedback,
  devMode,
}: SpeakingPhaseProps) {
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typedReading, setTypedReading] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        setRecordedAudio(new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }
  };

  const handleSubmit = async () => {
    if (!recordedAudio) {
      return;
    }
    setIsSubmitting(true);
    try {
      const base64Wav = await blobToWavBase64(recordedAudio);
      if (base64Wav) {
        await onSendResponse({ audioData: base64Wav, sampleRate: TARGET_SAMPLE_RATE });
        onClearFeedback();
        setRecordedAudio(null);
      }
    } catch (err) {
      console.error('Error submitting speaking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTyped = async () => {
    const t = typedReading.trim();
    if (!t) return;
    setIsSubmitting(true);
    try {
      await onSendResponse({ textResponse: t });
      onClearFeedback();
      setTypedReading('');
    } catch (err) {
      console.error('Error submitting speaking (text):', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 mb-4">
      <div className="bg-white rounded-lg p-6 border-2 border-green-300 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="h-5 w-5 text-green-600" />
          <h4 className="font-semibold text-gray-900">Paragraph to Speak</h4>
        </div>
        {paragraph ? (
          <p className="text-gray-800 leading-relaxed text-lg">{paragraph}</p>
        ) : (
          <p className="text-gray-500 italic">Waiting for paragraph...</p>
        )}
      </div>
      <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
        <p className="text-sm text-gray-600 mb-4">
          {devMode
            ? 'Dev mode: type the paragraph (or your best attempt) below and send — no microphone.'
            : instruction ??
              'Please read the paragraph above and speak it word for word using the record button below.'}
        </p>
        {devMode ? (
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            <textarea
              value={typedReading}
              onChange={(e) => setTypedReading(e.target.value)}
              disabled={isSubmitting || isProcessing}
              placeholder="Type your reading here…"
              rows={5}
              className="w-full rounded-lg border border-green-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void handleSubmitTyped()}
              disabled={isSubmitting || isProcessing || !typedReading.trim()}
              className="self-end flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              {isSubmitting || isProcessing ? 'Submitting...' : 'Send text'}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                <Square className="h-5 w-5" />
                Stop Recording
              </button>
            )}
            {recordedAudio && !isRecording && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                {isSubmitting || isProcessing ? 'Submitting...' : 'Submit Speaking'}
              </button>
            )}
          </div>
        )}
        {(isSubmitting || isProcessing) && !feedback && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-blue-600 font-medium">Analyzing your speaking...</span>
          </div>
        )}
        {feedback && !feedback.includes('Please read the following paragraph') && !(paragraph && feedback.includes(paragraph)) && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-2">Feedback</h5>
            <p className="text-gray-800 leading-relaxed text-sm">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}
