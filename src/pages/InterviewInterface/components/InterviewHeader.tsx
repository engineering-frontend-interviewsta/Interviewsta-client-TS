import { Link } from 'react-router-dom';
import { Clock, Download, Square } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';
import logoImg from '../../../assets/logo.png';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export interface InterviewHeaderProps {
  elapsedSeconds: number;
  onExportTranscript?: () => void;
  onEndClick: () => void;
  isEnding: boolean;
  isComplete: boolean;
}

export default function InterviewHeader({
  elapsedSeconds,
  onExportTranscript,
  onEndClick,
  isEnding,
  isComplete,
}: InterviewHeaderProps) {
  return (
    <header className="interview-header">
      <div className="interview-header__inner">
        <div className="interview-header__left">
          <Link to={ROUTES.STUDENT_DASHBOARD} className="interview-header__brand">
            <img src={logoImg} alt="Interviewsta" className="interview-header__logo" />
          </Link>
          {!isComplete && (
            <>
              <span className="interview-header__sep" aria-hidden>|</span>
              <div className="interview-header__live">
                <span className="interview-header__live-dot" />
                <span className="interview-header__live-label">Live</span>
              </div>
              <span className="interview-header__sep interview-header__sep--sm" aria-hidden>|</span>
              <div className="interview-header__timer">
                <Clock aria-hidden />
                <span className="interview-header__timer-value">{formatTime(elapsedSeconds)}</span>
              </div>
            </>
          )}
        </div>
        <div className="interview-header__right">
          {onExportTranscript && (
            <button type="button" onClick={onExportTranscript} className="interview-header__icon-btn" title="Export transcript">
              <Download aria-hidden />
            </button>
          )}
          {!isComplete && (
            <button
              type="button"
              onClick={onEndClick}
              disabled={isEnding}
              className="interview-header__end-btn"
              title="End interview (confirmation required)"
            >
              <Square aria-hidden />
              End Interview
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
