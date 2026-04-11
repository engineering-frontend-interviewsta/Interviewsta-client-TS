import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getOrgTeacherDetail } from '../../../services/b2bService';
import '../../B2B/B2B.css';

type TeacherDetailResponse = {
  teacher: { teacherUserId: string; name: string; email: string };
  classes: Array<{ classId: string; name: string; code: string; studentCount: number }>;
  students: Array<{
    studentUserId: string;
    name: string;
    email: string;
    averageScore: number;
    feedbackCount: number;
  }>;
};

export default function OrgTeacherDetailPage() {
  const { roles } = useAuth();
  const { teacherUserId = '' } = useParams();
  const [data, setData] = useState<TeacherDetailResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await getOrgTeacherDetail(teacherUserId);
        setData(response.data as TeacherDetailResponse);
      } catch {
        setError('Unable to load teacher detail');
      }
    })();
  }, [teacherUserId]);

  if (!roles?.includes('org_admin')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="b2b-page b2b-page--narrow">
      <div className="b2b-header">
        <h1 className="b2b-title">Teacher detail</h1>
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
            <p className="b2b-item-title">{data.teacher.name}</p>
            <p className="b2b-item-meta">{data.teacher.email}</p>
          </section>
          <section className="b2b-section">
            <h2 className="b2b-section-title">Classes</h2>
            <div className="b2b-list">
              {data.classes.map((c) => (
                <div key={c.classId} className="b2b-item">
                  <p className="b2b-item-title">{c.name}</p>
                  <p className="b2b-item-row">Code: {c.code} | Students: {c.studentCount}</p>
                </div>
              ))}
              {data.classes.length === 0 ? <p className="b2b-empty">No classes found.</p> : null}
            </div>
          </section>
          <section className="b2b-section">
            <h2 className="b2b-section-title">Students</h2>
            <div className="b2b-list">
              {data.students.map((s) => (
                <div key={s.studentUserId} className="b2b-item">
                  <div className="b2b-item-top">
                    <div>
                      <p className="b2b-item-title">{s.name}</p>
                      <p className="b2b-item-meta">{s.email}</p>
                    </div>
                    <Link className="b2b-link" to={`/org/students/${s.studentUserId}`}>
                      View student
                    </Link>
                  </div>
                  <p className="b2b-item-row">
                    Avg: {s.averageScore.toFixed(1)} | Feedbacks: {s.feedbackCount}
                  </p>
                </div>
              ))}
              {data.students.length === 0 ? <p className="b2b-empty">No students found.</p> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
