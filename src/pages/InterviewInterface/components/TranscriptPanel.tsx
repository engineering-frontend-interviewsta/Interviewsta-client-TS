import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import type { InterviewMessage } from '../../../hooks/useInterviewSession';

export interface TranscriptPanelProps {
  messages: InterviewMessage[];
  status: string;
  /** Optional current AI message when no messages yet (e.g. connecting) */
  fallbackMessage?: string;
  /** When true, show "Your turn to speak" card so user knows they can respond */
  isUserTurnToSpeak?: boolean;
  /** When true, user is currently speaking (VAD detected) */
  userSpeaking?: boolean;
  className?: string;
}

export default function TranscriptPanel({
  messages,
  status,
  fallbackMessage,
  isUserTurnToSpeak = false,
  userSpeaking = false,
  className = '',
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isUserTurnToSpeak, userSpeaking]);

  return (
    <div
      className={`flex flex-col min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className="flex-1 min-h-[200px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-slate-50/30">
        {messages.length === 0 && !fallbackMessage && (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center text-slate-500">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Conversation will appear here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {status === 'connecting' ? 'Connecting…' : 'Speak or type to respond'}
            </p>
          </div>
        )}
        {messages.length === 0 && fallbackMessage && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap">
              {fallbackMessage}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                msg.type === 'user'
                  ? 'bg-blue-600'
                  : 'bg-slate-700'
              }`}
            >
              {msg.type === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className={`flex-1 min-w-0 max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.type === 'user'
                  ? 'bg-blue-50 text-slate-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isUserTurnToSpeak && (
          <div className="flex justify-end">
            <div className="flex items-start gap-3 max-w-[85%] flex-row-reverse">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-600">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-xl px-4 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-3 h-3 rounded-full bg-blue-200 animate-ping opacity-75" />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {userSpeaking ? 'You\'re speaking…' : 'Your turn to speak'}
                    </span>
                    <span className="text-xs text-blue-100">
                      {userSpeaking
                        ? 'Your response will be sent when you finish.'
                        : 'Answer in your own words. Speak or type below.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
