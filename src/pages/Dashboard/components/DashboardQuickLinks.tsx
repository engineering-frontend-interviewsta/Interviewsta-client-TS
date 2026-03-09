import { Link } from 'react-router-dom';
import { Video, BookOpen, FileText, User } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';

const links = [
  { to: ROUTES.VIDEO_INTERVIEW, icon: Video, label: 'Video interview', description: 'Practice with AI' },
  { to: ROUTES.LEARNING, icon: BookOpen, label: 'Learning', description: 'Concepts & practice' },
  { to: ROUTES.RESUME_ANALYSIS, icon: FileText, label: 'Resume analysis', description: 'Upload & analyze' },
  { to: ROUTES.ACCOUNT, icon: User, label: 'Account', description: 'Settings & billing' },
];

export default function DashboardQuickLinks() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {links.map(({ to, icon: Icon, label, description }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col gap-2"
          >
            <Icon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">{label}</span>
            <span className="text-xs text-gray-500">{description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
