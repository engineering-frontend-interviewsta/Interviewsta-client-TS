import { useCallback, useEffect } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';
import { TIMEOUTS } from '../../constants/appConstants';

export default function RouteError() {
  const error = useRouteError() as { message?: string; statusText?: string } | null;
  const navigate = useNavigate();

  const isChunkError =
    error &&
    (String(error.message ?? '').includes('Failed to fetch dynamically imported module') ||
      String(error.message ?? '').includes('Loading chunk') ||
      String((error as { name?: string }).name) === 'ChunkLoadError');

  const handleReload = useCallback(() => {
    if (typeof caches !== 'undefined') {
      caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    if (isChunkError) {
      const t = setTimeout(handleReload, TIMEOUTS.ERROR_RELOAD_DELAY);
      return () => clearTimeout(t);
    }
  }, [isChunkError, handleReload]);

  const message =
    error?.statusText ?? (error && 'message' in error ? String(error.message) : null) ??
    'Something went wrong. Try reloading the page.';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-neutral-100">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-neutral-800 mb-2">
          {isChunkError ? 'Updating application…' : 'Something went wrong'}
        </h1>
        <p className="text-neutral-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={handleReload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-200"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
