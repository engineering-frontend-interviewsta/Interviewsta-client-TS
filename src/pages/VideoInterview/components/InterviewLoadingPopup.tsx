import { Brain, CheckCircle, Loader2, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50" />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Your Interview</h2>
            </div>
            <div className="space-y-4">
              {STAGES.map((stage, index) => {
                const isCompleted = progress >= stage.progressThreshold;
                const isCurrent = activeStage >= 0 && index === activeStage && !isCompleted;
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : isCurrent
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      ) : (
                        <Icon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">{stage.message}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
