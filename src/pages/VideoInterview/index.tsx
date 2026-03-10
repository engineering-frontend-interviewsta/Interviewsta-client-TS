import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { startInterview, getStartTaskStatus } from '../../services/interviewService';
import { ROUTES } from '../../constants/routerConstants';
import {
  ALL_INTERVIEW_OPTIONS,
  getBackendInterviewType,
  getBackendPayload,
} from '../../data/interviewTypesData';
import type { InterviewTypeEntry } from '../../types/interviewTypes';
import InterviewLoadingPopup from './components/InterviewLoadingPopup';

const START_POLL_MS = 1500;
const START_POLL_MAX = 60;

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  'interview-type': 'Interview type',
  'company-wise': 'Company wise',
  'subject-wise': 'DSA / Subject',
  'topic-wise': 'Subjects / Topic',
  'role-wise': 'Role-based',
  'case-study-wise': 'Case study',
};

export default function VideoInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [startProgress, setStartProgress] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    let list = ALL_INTERVIEW_OPTIONS;
    if (selectedCategory !== 'all') {
      list = list.filter((e) => (e.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) ||
          (e.company || '').toLowerCase().includes(q) ||
          (e.subject || '').toLowerCase().includes(q) ||
          (e.role || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_INTERVIEW_OPTIONS.length };
    for (const e of ALL_INTERVIEW_OPTIONS) {
      const c = (e.category || '').toLowerCase() || 'other';
      counts[c] = (counts[c] || 0) + 1;
    }
    return Object.entries(counts).map(([id, count]) => ({
      id,
      label: CATEGORY_LABELS[id] || id,
      count,
    }));
  }, []);

  const handleStart = async (entry: InterviewTypeEntry) => {
    if (!user?.email) {
      setStartError('Please sign in to start an interview.');
      return;
    }
    setStartError(null);
    setStarting(true);
    setStartProgress(0);
    const interviewType = getBackendInterviewType(entry);
    const payload = getBackendPayload(entry);
    try {
      const userId = user.email;
      const result = await startInterview({
        interviewType,
        userId,
        payload,
      });
      let attempts = 0;
      const poll = async (): Promise<void> => {
        if (attempts >= START_POLL_MAX) {
          setStartError('Session start timed out.');
          setStarting(false);
          return;
        }
        attempts++;
        const statusResult = await getStartTaskStatus(result.taskId);
        const progress =
          typeof statusResult.progress === 'number' ? statusResult.progress : Math.min(90, attempts * 15);
        setStartProgress(progress);
        if (statusResult.status === 'completed') {
          setStartProgress(100);
          setStarting(false);
          navigate(ROUTES.INTERVIEW_INTERFACE, {
            state: { sessionId: result.sessionId, interviewType, interviewTypeId: entry.id },
          });
          return;
        }
        if (statusResult.status === 'failed') {
          setStartError(statusResult.error ?? 'Failed to start session.');
          setStarting(false);
          return;
        }
        setTimeout(poll, START_POLL_MS);
      };
      await poll();
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Failed to start interview.');
      setStarting(false);
    }
  };

  return (
    <>
      {starting && <InterviewLoadingPopup progress={startProgress} />}
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Interview</h1>
          <p className="text-gray-600 mb-4">
            {user?.displayName ?? user?.email ?? 'User'}, choose an interview type to start.
          </p>
          {startError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{startError}</div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map(({ id, label, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCategory(id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedCategory === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          <div className="mb-4">
            <input
              type="search"
              placeholder="Search by title, company, subject, role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-3 mb-8">
            {filteredOptions.length === 0 ? (
              <p className="text-gray-500">No options match your filters.</p>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={`${opt.id}-${opt.category}-${opt.title}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{opt.title}</h3>
                    <p className="text-sm text-gray-500">
                      {opt.difficulty} · {opt.duration} min
                      {opt.questions != null ? ` · ${opt.questions} questions` : ''}
                    </p>
                    {opt.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{opt.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={starting}
                    onClick={() => handleStart(opt)}
                    className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {starting ? 'Starting…' : 'Start'}
                  </button>
                </div>
              ))
            )}
          </div>
          <Link to={ROUTES.STUDENT_DASHBOARD} className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
