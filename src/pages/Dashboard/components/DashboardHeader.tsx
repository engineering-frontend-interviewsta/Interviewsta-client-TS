import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';

interface DashboardHeaderProps {
  displayName: string | null;
}

export default function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {displayName || 'User'}
            </span>
            !
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Here&apos;s your interview preparation progress
          </p>
        </div>
        <Link
          to={ROUTES.VIDEO_INTERVIEW}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm md:text-base text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:opacity-90 transition-opacity"
        >
          <span className="flex items-center gap-2.5">
            Start interview
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
