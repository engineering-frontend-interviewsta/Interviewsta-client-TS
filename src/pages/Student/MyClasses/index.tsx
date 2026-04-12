import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import { useAuth } from '../../../context/AuthContext';
import { getStudentClasses, studentJoinClass, type TeacherClass } from '../../../services/b2bService';

export default function StudentMyClassesPage() {
  const { roles } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const response = await getStudentClasses();
    setClasses(response.data);
  };

  useEffect(() => {
    void load();
  }, []);

  if (!roles?.includes('student')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">My classes</h1>
      <form
        className="mt-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setLoading(true);
          try {
            await studentJoinClass(classCode.trim().toUpperCase());
            setClassCode('');
            await load();
          } catch (err: unknown) {
            const message =
              err && typeof err === 'object' && 'response' in err
                ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                  'Failed to join class')
                : 'Failed to join class';
            setError(message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          className="flex-1 rounded border p-2 uppercase"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          placeholder="Enter class join code"
          required
        />
        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-60" disabled={loading} type="submit">
          {loading ? 'Joining...' : 'Join class'}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 space-y-3">
        {classes.map((item) => (
          <div key={item.classId} className="rounded border p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-medium">{item.name}</h2>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs">Code: {item.code}</span>
            </div>
            {item.description ? <p className="mt-2 text-sm text-gray-600">{item.description}</p> : null}
          </div>
        ))}
        {classes.length === 0 ? <p className="text-sm text-gray-600">You have not joined any class yet.</p> : null}
      </div>
    </div>
  );
}
