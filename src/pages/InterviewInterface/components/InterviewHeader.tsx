import { Link } from 'react-router-dom';
import { Clock, Download, Square, Zap } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export interface InterviewHeaderProps {
  elapsedSeconds: number;
  devMode: boolean;
  onToggleDevMode: () => void;
  onExportTranscript?: () => void;
  onEndClick: () => void;
  isEnding: boolean;
  isComplete: boolean;
}

export default function InterviewHeader({
  elapsedSeconds,
  devMode,
  onToggleDevMode,
  onExportTranscript,
  onEndClick,
  isEnding,
  isComplete,
}: InterviewHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white px-4 py-3 shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.STUDENT_DASHBOARD}
            className="font-semibold text-neutral-800 hover:text-neutral-600"
          >
            Interviewsta
          </Link>
          {!isComplete && (
            <>
              <span className="text-neutral-400">|</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-sm text-neutral-600">Live</span>
              </div>
              <span className="text-neutral-400 hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-600">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{formatTime(elapsedSeconds)}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExportTranscript && (
            <button
              type="button"
              onClick={onExportTranscript}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Export transcript"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleDevMode}
            className={`p-2 rounded-lg transition-colors ${
              devMode
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
            }`}
            title={devMode ? 'Dev mode: ON' : 'Dev mode: OFF'}
          >
            <Zap className="h-4 w-4" />
          </button>
          {!isComplete && (
            <button
              type="button"
              onClick={onEndClick}
              disabled={isEnding}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-800 text-white hover:bg-neutral-700"
            >
              <Square className="h-3.5 w-3.5" />
              End Interview
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
