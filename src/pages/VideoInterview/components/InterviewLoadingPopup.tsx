import { Brain, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import './InterviewLoadingPopup.css';

const STAGES = [
  { id: 0, progressThreshold: 10, message: 'Setting up your interview...', icon: Loader2 },
  { id: 1, progressThreshold: 50, message: 'Glee is ready and assigned to you', icon: Brain },
  { id: 2, progressThreshold: 80, message: 'Glee has your first response ready', icon: Sparkles },
  { id: 3, progressThreshold: 100, message: 'Ready!', icon: CheckCircle },
];

interface InterviewLoadingPopupProps {
  progress: number;
}

export default function InterviewLoadingPopup({ progress }: InterviewLoadingPopupProps) {
  const activeStageIndex = STAGES.findIndex((s) => progress < s.progressThreshold);
  const activeStage = activeStageIndex === -1 ? STAGES.length - 1 : activeStageIndex;

  return (
    <div
      className="interview-loading-popup"
      role="dialog"
      aria-modal="true"
      aria-label="Preparing your interview"
      aria-live="polite"
    >
      <div className="interview-loading-popup__backdrop">
        <div className="interview-loading-popup__card">
          <div className="interview-loading-popup__card-bg" aria-hidden="true" />
          <div className="interview-loading-popup__content">
            <div className="interview-loading-popup__header">
              <div className="interview-loading-popup__icon-wrap">
                <Brain aria-hidden="true" />
              </div>
              <h2 className="interview-loading-popup__title">Preparing Your Interview</h2>
            </div>
            <div className="interview-loading-popup__stages">
              {STAGES.map((stage, index) => {
                const isCompleted = progress >= stage.progressThreshold;
                const isCurrent = activeStage >= 0 && index === activeStage && !isCompleted;
                const Icon = stage.icon;
                const stageClass =
                  isCompleted
                    ? 'interview-loading-popup__stage--completed'
                    : isCurrent
                      ? 'interview-loading-popup__stage--current'
                      : 'interview-loading-popup__stage--pending';
                const iconClass = isCurrent ? ' interview-loading-popup__stage-icon--spin' : '';
                return (
                  <div
                    key={stage.id}
                    className={`interview-loading-popup__stage ${stageClass}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div className={`interview-loading-popup__stage-icon${iconClass}`}>
                      {isCompleted ? (
                        <CheckCircle aria-hidden="true" />
                      ) : isCurrent ? (
                        <Loader2 aria-hidden="true" />
                      ) : (
                        <Icon aria-hidden="true" />
                      )}
                    </div>
                    <span className="interview-loading-popup__stage-message">{stage.message}</span>
                  </div>
                );
              })}
            </div>
            <div className="interview-loading-popup__progress-wrap">
              <div
                className="interview-loading-popup__progress-bar"
                style={{ width: `${Math.min(100, progress)}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
