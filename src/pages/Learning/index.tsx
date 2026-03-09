import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';
import { BookOpen } from 'lucide-react';

const TOPICS = [
  { to: ROUTES.LEARNING_ARRAYS, title: 'Arrays', description: 'Two pointers, sliding window, prefix sum' },
];

export default function Learning() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning</h1>
        <p className="text-gray-600 mb-6">
          Concepts, practice, and video solutions for interview prep.
        </p>
        <div className="grid gap-4 mb-6">
          {TOPICS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t.title}</h3>
                <p className="text-sm text-gray-600">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
