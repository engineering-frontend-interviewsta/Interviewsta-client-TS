import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getStudentClassDetail, type StudentClassDetailResponse } from '../../../services/b2bService';
import '../../B2B/B2B.css';
import '../../Teacher/ClassDetail/TeacherClassDetail.css';

export default function StudentClassDetailPage() {
  const { roles } = useAuth();
  const { classId = '' } = useParams();
  const [data, setData] = useState<StudentClassDetailResponse | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'announcements' | 'assignments'>('announcements');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentClassDetail(classId);
        setData(res.data);
      } catch {
        setError('Unable to load class details.');
      }
    })();
  }, [classId]);

  if (!roles?.includes('student')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="b2b-page b2b-page--full">
      <div className="b2b-header">
        <h1 className="b2b-title">Class</h1>
      </div>
      <p className="b2b-subtitle">
        <Link className="b2b-link" to={ROUTES.STUDENT_MY_CLASSES}>
          ← Back to My classes
        </Link>
      </p>

      {error ? <p className="b2b-error">{error}</p> : null}

      {!data ? (
        <p className="b2b-loading">Loading...</p>
      ) : (
        <>
          {/* Hero */}
          <section className="tcd-hero">
            <div className="tcd-hero__top">
              <div className="tcd-hero__titlewrap">
                <h2 className="tcd-hero__title">{data.class.name}</h2>
                <p className="tcd-hero__subtitle">{data.class.description || 'No description added.'}</p>
              </div>
              <div className="tcd-hero__code">
                <span className="tcd-hero__code-label">Class code</span>
                <span className="tcd-hero__code-value">{data.class.code}</span>
                <button
                  type="button"
                  className="tcd-hero__copy"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(data.class.code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="tcd-metrics">
              <div className="tcd-metric">
                <p className="tcd-metric__label">Announcements</p>
                <p className="tcd-metric__value">{data.announcements.length}</p>
              </div>
              <div className="tcd-metric">
                <p className="tcd-metric__label">Assignments</p>
                <p className="tcd-metric__value">{data.assignments.length}</p>
              </div>
              <div className="tcd-metric">
                <p className="tcd-metric__label">Pinned</p>
                <p className="tcd-metric__value">{data.announcements.filter((a) => a.isPinned).length}</p>
              </div>
              <div className="tcd-metric">
                <p className="tcd-metric__label">Due soon</p>
                <p className="tcd-metric__value">
                  {
                    data.assignments.filter((a) => {
                      if (!a.dueAt) return false;
                      const diff = new Date(a.dueAt).getTime() - Date.now();
                      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
                    }).length
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="tcd-tabs" role="tablist" aria-label="Class sections">
            <button
              type="button"
              className={`tcd-tab${tab === 'announcements' ? ' tcd-tab--active' : ''}`}
              onClick={() => setTab('announcements')}
            >
              Announcements
            </button>
            <button
              type="button"
              className={`tcd-tab${tab === 'assignments' ? ' tcd-tab--active' : ''}`}
              onClick={() => setTab('assignments')}
            >
              Assignments
            </button>
          </div>

          {/* Announcements */}
          {tab === 'announcements' ? (
            <section className="b2b-section">
              <div className="tcd-sectionhead">
                <div>
                  <h2 className="b2b-section-title">Announcements</h2>
                  <p className="tcd-muted" style={{ marginTop: '0.35rem' }}>
                    {data.announcements.length} total · pinned items shown first
                  </p>
                </div>
              </div>

              <div className="tcd-stack">
                {data.announcements.length === 0 ? (
                  <p className="b2b-empty">No announcements yet.</p>
                ) : (
                  [...data.announcements]
                    .sort((a, b) => {
                      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((a) => (
                      <div key={a.id} className={`tcd-card${a.isPinned ? ' tcd-card--pinned' : ''}`}>
                        <p className="tcd-card__title">
                          {a.isPinned ? <span className="tcd-pill">Pinned</span> : null}
                          {a.title}
                        </p>
                        <p className="tcd-card__meta">{new Date(a.createdAt).toLocaleString()}</p>
                        {a.body ? <p className="tcd-card__body">{a.body}</p> : null}
                      </div>
                    ))
                )}
              </div>
            </section>
          ) : null}

          {/* Assignments */}
          {tab === 'assignments' ? (
            <section className="b2b-section">
              <div className="tcd-sectionhead">
                <div>
                  <h2 className="b2b-section-title">Assignments</h2>
                  <p className="tcd-muted" style={{ marginTop: '0.35rem' }}>
                    {data.assignments.length} total
                  </p>
                </div>
              </div>

              <div className="tcd-stack">
                {data.assignments.length === 0 ? (
                  <p className="b2b-empty">No assignments yet.</p>
                ) : (
                  [...data.assignments]
                    .sort((a, b) => {
                      // Due-soon first, then by creation date
                      const aHasDue = !!a.dueAt;
                      const bHasDue = !!b.dueAt;
                      if (aHasDue && bHasDue)
                        return new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime();
                      if (aHasDue) return -1;
                      if (bHasDue) return 1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((a) => {
                      const isDueSoon =
                        !!a.dueAt &&
                        new Date(a.dueAt).getTime() - Date.now() > 0 &&
                        new Date(a.dueAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                      const isOverdue = !!a.dueAt && new Date(a.dueAt).getTime() < Date.now();
                      return (
                        <div key={a.id} className="tcd-card">
                          <p className="tcd-card__title">
                            {isDueSoon ? <span className="tcd-pill" style={{ background: 'rgba(245,158,11,0.12)', color: '#92400e', borderColor: 'rgba(245,158,11,0.35)' }}>Due soon</span> : null}
                            {isOverdue ? <span className="tcd-pill" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c', borderColor: 'rgba(220,38,38,0.25)' }}>Overdue</span> : null}
                            {a.title}
                          </p>
                          <p className="tcd-card__meta">
                            {a.dueAt
                              ? `Due ${new Date(a.dueAt).toLocaleString()}`
                              : `Posted ${new Date(a.createdAt).toLocaleString()}`}
                          </p>
                          {a.description ? <p className="tcd-card__body">{a.description}</p> : null}
                        </div>
                      );
                    })
                )}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
