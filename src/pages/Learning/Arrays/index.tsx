import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { BookOpen, PlayCircle, Code } from 'lucide-react';

const CONCEPTS = [
  { id: 'two-pointers', title: 'Two Pointers', description: 'Solve array problems with two indices moving in same or opposite direction.' },
  { id: 'sliding-window', title: 'Sliding Window', description: 'Fixed or variable window for subarray/substring problems.' },
  { id: 'prefix-sum', title: 'Prefix Sum', description: 'Precompute cumulative sums for fast range queries.' },
  { id: 'binary-search', title: 'Binary Search on Arrays', description: 'Apply binary search on sorted or conceptually sorted arrays.' },
];

export default function LearningArrays() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Arrays</h1>
        <p className="text-gray-600 mb-6">
          Core concepts and practice for array problems in interviews.
        </p>
        <div className="grid gap-4 mb-8">
          {CONCEPTS.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
            <Code className="h-4 w-4" />
            Practice (coming soon)
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
            <PlayCircle className="h-4 w-4" />
            Video solutions (coming soon)
          </span>
        </div>
        <Link to={ROUTES.LEARNING} className="text-blue-600 hover:underline">
          Back to Learning
        </Link>
      </div>
    </div>
  );
}
