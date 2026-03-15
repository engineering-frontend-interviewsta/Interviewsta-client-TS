import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Search, ArrowLeft, ChevronRight } from 'lucide-react';
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
import './VideoInterview.css';

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

function getDifficultyClass(difficulty: string): 'easy' | 'medium' | 'hard' {
  const d = (difficulty || '').toLowerCase();
  if (d === 'easy') return 'easy';
  if (d === 'hard') return 'hard';
  return 'medium';
}

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
      <main className="video-interview" role="main" aria-label="Video Interview">
        <div className="video-interview__inner">
          <header className="video-interview__header">
            <div className="video-interview__title-row">
              <span className="video-interview__title-icon" aria-hidden>
                <Video />
              </span>
              <h1 className="video-interview__title">Interview Library</h1>
            </div>
            <p className="video-interview__subtitle">
              Explore interview types by category—company, role, DSA, case study, and more. Pick one and start your practice session.
            </p>
          </header>
          {startError && (
            <div className="video-interview__error" role="alert">
              {startError}
            </div>
          )}

          <div className="video-interview__toolbar">
            <div className="video-interview__filters" role="group" aria-label="Filter by category">
              {categories.map(({ id, label, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCategory(id)}
                  className={`video-interview__pill ${selectedCategory === id ? 'video-interview__pill--active' : ''}`}
                  aria-pressed={selectedCategory === id}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
            <div className="video-interview__search-wrap">
              <Search aria-hidden />
              <input
                type="search"
                placeholder="Search by title, company, subject, role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="video-interview__search"
                aria-label="Search interview types"
              />
            </div>
          </div>

          <div className="video-interview__list">
            {filteredOptions.length === 0 ? (
              <div className="video-interview__empty">
                <span className="video-interview__empty-icon" aria-hidden>
                  <Search />
                </span>
                <span>No interviews match your filters.</span>
                <span>Try a different category or search term.</span>
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <article
                  key={`${opt.id}-${opt.category}-${opt.title}`}
                  className="video-interview__card"
                >
                  <div className="video-interview__card-header" aria-hidden />
                  <div className="video-interview__card-body">
                    <div className="video-interview__card-tags">
                      <span className="video-interview__card-tag video-interview__card-tag--category">
                        {CATEGORY_LABELS[(opt.category || '').toLowerCase()] || opt.category || 'Interview'}
                      </span>
                      <span className={`video-interview__card-tag video-interview__card-tag--${getDifficultyClass(opt.difficulty)}`}>
                        {opt.difficulty || 'Medium'}
                      </span>
                      <span className="video-interview__card-tag video-interview__card-tag--duration">
                        {opt.duration} min
                        {opt.questions != null ? ` · ${opt.questions} Qs` : ''}
                      </span>
                    </div>
                    <h3 className="video-interview__card-title">{opt.title}</h3>
                    {opt.description ? (
                      <p className="video-interview__card-description">{opt.description}</p>
                    ) : (
                      <p className="video-interview__card-description">
                        Practice with this interview type. Click Start to begin your session.
                      </p>
                    )}
                    <div className="video-interview__card-footer">
                      <button
                        type="button"
                        disabled={starting}
                        onClick={() => handleStart(opt)}
                        className="video-interview__btn-start"
                      >
                        {starting ? 'Starting…' : 'Start interview'}
                        <ChevronRight aria-hidden />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          <div className="video-interview__back-wrap">
            <Link to={ROUTES.STUDENT_DASHBOARD} className="video-interview__back">
              <ArrowLeft aria-hidden />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
