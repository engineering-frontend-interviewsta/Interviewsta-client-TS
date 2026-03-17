import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  startInterview,
  getStartTaskStatus,
  getInterviewTests,
  getInterviewParentTypes,
  getInterviewTestsByParentType,
  getInterviewAccessToken,
  InterviewAccessTokenError,
} from '../../services/interviewService';
import { setInterviewAccessToken, clearInterviewAccessToken } from '../../api/axiosInstance';
import { ROUTES } from '../../constants/routerConstants';
import type { InterviewTest, ParentInterviewType } from '../../types/interviewTest';
import InterviewLoadingPopup from './components/InterviewLoadingPopup';
import './VideoInterview.css';

const START_POLL_MS = 1500;
const START_POLL_MAX = 60;
const PAGE_SIZE = 10;

function getDifficultyClass(difficulty: string): 'easy' | 'medium' | 'hard' {
  const d = (difficulty || '').toLowerCase();
  if (d === 'easy') return 'easy';
  if (d === 'hard') return 'hard';
  return 'medium';
}

export default function VideoInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parentTypes, setParentTypes] = useState<ParentInterviewType[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [tests, setTests] = useState<InterviewTest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [starting, setStarting] = useState(false);
  const [startProgress, setStartProgress] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = page < totalPages;

  const loadParentTypes = useCallback(async () => {
    try {
      const list = await getInterviewParentTypes();
      setParentTypes(list);
    } catch {
      setParentTypes([]);
    }
  }, []);

  const loadTests = useCallback(
    async (pageNum: number, append: boolean) => {
      const isLoadMore = pageNum > 1;
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      try {
        if (selectedParentId == null) {
          const res = await getInterviewTests({ page: pageNum, limit: PAGE_SIZE });
          setTests((prev) => (append ? [...prev, ...res.data] : res.data));
          setTotalPages(res.totalPages);
          setTotal(res.total);
          setTotalAll(res.total);
        } else {
          const res = await getInterviewTestsByParentType(selectedParentId, {
            page: pageNum,
            limit: PAGE_SIZE,
          });
          setTests((prev) => (append ? [...prev, ...res.data] : res.data));
          setTotalPages(res.totalPages);
          setTotal(res.total);
        }
      } catch {
        if (!append) setTests([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedParentId]
  );

  useEffect(() => {
    void loadParentTypes();
  }, [loadParentTypes]);

  useEffect(() => {
    setPage(1);
  }, [selectedParentId]);

  useEffect(() => {
    if (page < 1) return;
    void loadTests(page, page > 1);
  }, [page, selectedParentId, loadTests]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setPage((p) => p + 1);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) loadMore();
      },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, loadMore]);

  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return tests;
    const q = searchQuery.toLowerCase();
    return tests.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.company || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.parent?.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    );
  }, [tests, searchQuery]);

  const handleStart = async (test: InterviewTest) => {
    if (!user?.email) {
      setStartError('Please sign in to start an interview.');
      return;
    }
    setStartError(null);
    const interviewType = test.parent?.type ?? 'technical';
    const tags = (test.topics?.length ? test.topics : test.subjects) ?? [];
    const payload = {
      interview_test_id: test.id,
      ...(test.company && { company: test.company }),
      ...(tags.length > 0 && { Tags: tags }),
    };
    try {
      const token = await getInterviewAccessToken(String(test.id));
      setInterviewAccessToken(token);
      setStarting(true);
      setStartProgress(0);
      const result = await startInterview({
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
            state: { sessionId: result.sessionId, interviewType, interviewTypeId: test.id },
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
      clearInterviewAccessToken();
      if (err instanceof InterviewAccessTokenError) {
        setStartError(err.message);
      } else {
        setStartError(err instanceof Error ? err.message : 'Failed to start interview.');
      }
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

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedParentId(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                selectedParentId === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All{selectedParentId === null ? ` (${total})` : totalAll > 0 ? ` (${totalAll})` : ''}
            </button>
            {parentTypes.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedParentId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedParentId === p.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p.title}
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

          {loading && tests.length === 0 ? (
            <p className="text-gray-500 py-8">Loading interviews…</p>
          ) : filteredTests.length === 0 ? (
            <p className="text-gray-500 py-8">No options match your filters.</p>
          ) : (
            <div className="space-y-3 mb-8">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{test.title}</h3>
                    <p className="text-sm text-gray-500">
                      {test.difficulty} · {test.duration} min
                      {test.questions != null ? ` · ${test.questions} questions` : ''}
                      {test.parent?.title ? ` · ${test.parent.title}` : ''}
                    </p>
                    {test.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{test.description}</p>
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
                  <button
                    type="button"
                    disabled={starting}
                    onClick={() => handleStart(test)}
                    className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {starting ? 'Starting…' : 'Start'}
                  </button>
                </div>
              ))}
              <div ref={sentinelRef} className="h-4 flex items-center justify-center">
                {loadingMore && <span className="text-sm text-gray-500">Loading more…</span>}
              </div>
            </div>
          )}
          <Link to={ROUTES.STUDENT_DASHBOARD} className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </>
  );
}
