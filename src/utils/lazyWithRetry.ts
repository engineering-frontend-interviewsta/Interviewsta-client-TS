import { type ComponentType, lazy, type LazyExoticComponent } from 'react';
import { RETRY } from '../constants/appConstants';

/**
 * Lazy load a component with retry logic for failed module loads (e.g. after deploy).
 */
function lazyWithRetry<T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  retries = RETRY.DEFAULT_RETRIES,
  delay = RETRY.DEFAULT_DELAY
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (attemptNumber: number) => {
        importFunc()
          .then(resolve)
          .catch((error: Error) => {
            const isChunkError =
              error?.message?.includes('Failed to fetch dynamically imported module') ||
              error?.message?.includes('Loading chunk') ||
              error?.message?.includes('Loading CSS chunk') ||
              (error as Error & { name?: string }).name === 'ChunkLoadError';

            if (isChunkError && attemptNumber < retries) {
              if (typeof caches !== 'undefined') {
                caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
              }
              setTimeout(() => attempt(attemptNumber + 1), delay * attemptNumber);
            } else {
              reject(error);
            }
          });
      };
      attempt(1);
    });
  });
}

export default lazyWithRetry;
