import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getOrgDashboard, type OrgDashboardResponse } from '../../../services/b2bService';
import '../../B2B/B2B.css';

export default function OrgDashboardPage() {
  const { roles } = useAuth();
  const [data, setData] = useState<OrgDashboardResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await getOrgDashboard();
        setData(response.data);
      } catch {
        setError('Unable to load organization dashboard');
      }
    })();
  }, []);

  if (!roles?.includes('org_admin')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="b2b-page">
      <div className="b2b-header">
        <h1 className="b2b-title">Organization dashboard</h1>
      </div>
      {error ? <p className="b2b-error">{error}</p> : null}
      {!data ? (
        <p className="b2b-loading">Loading...</p>
      ) : (
        <>
          <p className="b2b-subtitle">
            {data.organization.name} ({data.organization.code})
          </p>
          <div className="b2b-grid-stats">
            <div className="b2b-stat-card">
              <p className="b2b-stat-label">Teachers</p>
              <p className="b2b-stat-value">{data.totals.teachers}</p>
            </div>
            <div className="b2b-stat-card">
              <p className="b2b-stat-label">Classes</p>
              <p className="b2b-stat-value">{data.totals.classes}</p>
            </div>
            <div className="b2b-stat-card">
              <p className="b2b-stat-label">Students</p>
              <p className="b2b-stat-value">{data.totals.students}</p>
            </div>
            <div className="b2b-stat-card">
              <p className="b2b-stat-label">Avg score</p>
              <p className="b2b-stat-value">{data.totals.averageScore.toFixed(1)}</p>
            </div>
          </div>

          <section className="b2b-section">
            <h2 className="b2b-section-title">Teacher-wise drilldown</h2>
            <div className="b2b-list">
              {data.teachers.map((t) => (
                <div key={t.teacherUserId} className="b2b-item">
                  <div className="b2b-item-top">
                    <div>
                      <p className="b2b-item-title">{t.name}</p>
                      <p className="b2b-item-meta">{t.email}</p>
                    </div>
                    <Link className="b2b-link" to={`/org/teachers/${t.teacherUserId}`}>
                      View details
                    </Link>
                  </div>
                  <p className="b2b-item-row">
                    Classes: {t.classCount} | Students: {t.studentCount} | Avg score: {t.avgScore.toFixed(1)}
                  </p>
                </div>
              ))}
              {data.teachers.length === 0 ? <p className="b2b-empty">No teachers yet.</p> : null}
            </div>
          </section>

          <section className="b2b-section">
            <h2 className="b2b-section-title">Class-wise drilldown</h2>
            <div className="b2b-list">
              {data.classes.map((c) => (
                <div key={c.classId} className="b2b-item">
                  <div className="b2b-item-top">
                    <div>
                      <p className="b2b-item-title">
                        {c.name} <span className="b2b-item-meta">(Code: {c.code})</span>
                      </p>
                      <p className="b2b-item-meta">Teacher: {c.teacherName}</p>
                    </div>
                    <Link className="b2b-link" to={`/org/classes/${c.classId}`}>
                      View details
                    </Link>
                  </div>
                  <p className="b2b-item-row">
                    Students: {c.studentCount} | Avg score: {c.avgScore.toFixed(1)}
                  </p>
                </div>
              ))}
              {data.classes.length === 0 ? <p className="b2b-empty">No classes yet.</p> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
