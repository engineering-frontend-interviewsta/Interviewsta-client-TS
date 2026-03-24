import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <h1 className="text-3xl font-bold text-neutral-800 mb-4">Welcome to Interviewsta</h1>
      <p className="text-neutral-600 mb-8">
        Practice interviews and improve your skills.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          to={ROUTES.PRICING}
          className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
        >
          View Pricing
        </Link>
        <Link
          to={ROUTES.LOGIN}
          className="px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-100"
        >
          Log in
        </Link>
        <Link
          to={ROUTES.SIGNUP}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
