import { CheckCircle, XCircle, Award } from 'lucide-react';
import type { MCQResultItem } from '../../../types/interview';

export interface MCQResultsProps {
  results: MCQResultItem[];
  onFinishInterview: () => void;
}

export default function MCQResults({ results, onFinishInterview }: MCQResultsProps) {
  if (!results?.length) {
    return (
      <div className="text-center text-gray-500 py-8 rounded-xl border border-gray-200 bg-white">
        No MCQ results available
      </div>
    );
  }

  const correctCount = results.filter(
    (r) => r.user_answer?.trim() === r.correct_answer?.trim()
  ).length;
  const total = results.length;
  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">MCQ Assessment Results</h2>
            <p className="text-indigo-100 text-sm">Your performance on vocabulary questions</p>
          </div>
          <div className="text-center">
            <Award className="h-10 w-10 mx-auto mb-1" />
            <div className="text-3xl font-bold">{percentage}%</div>
            <div className="text-xs text-indigo-100">
              {correctCount} / {total} correct
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {results.map((result, index) => {
          const isCorrect =
            result.user_answer?.trim() === result.correct_answer?.trim();
          return (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 ${
                isCorrect
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-700 text-sm">
                      Question {result.question_number ?? index + 1}:
                    </span>
                    {result.question && (
                      <span className="text-gray-600 text-sm line-clamp-1">
                        {result.question}
                      </span>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">Your answer: </span>
                      <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700'}>
                        {result.user_answer ?? '—'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p>
                        <span className="text-gray-500">Correct: </span>
                        <span className="text-green-700 font-medium">
                          {result.correct_answer ?? '—'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onFinishInterview}
        className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
      >
        Finish Interview
      </button>
    </div>
  );
}
