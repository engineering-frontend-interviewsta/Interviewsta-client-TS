import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';

export default function ResumeGeneration() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Generation</h1>
        <p className="text-gray-600 mb-6">
          Create or improve your resume. (To be migrated.)
        </p>
        <Link to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
