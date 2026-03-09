import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';

export default function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-600">404 – Page not found</h1>
      <p className="text-neutral-600 mt-2">
        The page you are looking for doesn’t exist or isn’t available.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300"
        >
          Go back
        </button>
        <Link
          to={ROUTES.HOME}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
