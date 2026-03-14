import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import type { InterviewMessage } from '../../../hooks/useInterviewSession';

export interface TranscriptPanelProps {
  messages: InterviewMessage[];
  status: string;
  /** Optional current AI message when no messages yet (e.g. connecting) */
  fallbackMessage?: string;
  className?: string;
}

export default function TranscriptPanel({
  messages,
  status,
  fallbackMessage,
  className = '',
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
