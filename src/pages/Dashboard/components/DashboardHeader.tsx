import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';

interface DashboardHeaderProps {
  displayName: string | null;
}

export default function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Welcome back, {displayName || 'User'}!
        </h1>
        <p className="text-sm text-gray-600 mt-1">Here&apos;s your interview preparation progress</p>
      </div>
      <Link
        to={ROUTES.VIDEO_INTERVIEW}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
      >
        <span>Start interview</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
