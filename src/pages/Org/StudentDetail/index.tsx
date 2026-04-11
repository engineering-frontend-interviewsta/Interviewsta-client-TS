import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getOrgStudentDetail } from '../../../services/b2bService';
import '../../B2B/B2B.css';

type StudentDetailResponse = {
  student: { studentUserId: string; name: string; email: string };
  summary: { classCount: number; feedbackCount: number; averageScore: number };
  classes: Array<{ classId: string; name: string; code: string }>;
  recentFeedbacks: Array<{
    feedbackId: string;
    overallScore: number;
    savedAt: string;
    interviewTitle: string;
  }>;
};

export default function OrgStudentDetailPage() {
  const { roles } = useAuth();
  const { studentUserId = '' } = useParams();
  const [data, setData] = useState<StudentDetailResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await getOrgStudentDetail(studentUserId);
        setData(response.data as StudentDetailResponse);
      } catch {
        setError('Unable to load student detail');
      }
    })();
  }, [studentUserId]);

  if (!roles?.includes('org_admin')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="b2b-page b2b-page--narrow">
      <div className="b2b-header">
        <h1 className="b2b-title">Student detail</h1>
      </div>
      <p className="b2b-subtitle">
        <Link className="b2b-link" to={ROUTES.ORG_DASHBOARD}>
          Back to dashboard
        </Link>
      </p>
      {error ? <p className="b2b-error">{error}</p> : null}
      {!data ? (
        <p className="b2b-loading">Loading...</p>
      ) : (
        <>
          <section className="b2b-section">
            <p className="b2b-item-title">{data.student.name}</p>
            <p className="b2b-item-meta">{data.student.email}</p>
            <p className="b2b-item-row">
              Classes: {data.summary.classCount} | Feedbacks: {data.summary.feedbackCount} | Avg:{' '}
              {data.summary.averageScore.toFixed(1)}
            </p>
          </section>

          <section className="b2b-section">
            <h2 className="b2b-section-title">Classes</h2>
            <div className="b2b-list">
              {data.classes.map((c) => (
                <div key={c.classId} className="b2b-item">
                  <p className="b2b-item-title">{c.name}</p>
                  <p className="b2b-item-meta">Code: {c.code}</p>
                </div>
              ))}
              {data.classes.length === 0 ? <p className="b2b-empty">No classes found.</p> : null}
            </div>
          </section>

          <section className="b2b-section">
            <h2 className="b2b-section-title">Recent interview feedbacks</h2>
            <div className="b2b-list">
              {data.recentFeedbacks.map((f) => (
                <div key={f.feedbackId} className="b2b-item">
                  <p className="b2b-item-title">{f.interviewTitle}</p>
                  <p className="b2b-item-row">
                    Score: {f.overallScore.toFixed(1)} | {new Date(f.savedAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {data.recentFeedbacks.length === 0 ? (
                <p className="b2b-empty">No feedback history yet.</p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
