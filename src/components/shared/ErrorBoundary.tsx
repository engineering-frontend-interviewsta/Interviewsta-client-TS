import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TIMEOUTS } from '../../constants/appConstants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  reloadTimeout: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      (error as Error & { name?: string }).name === 'ChunkLoadError';
    if (isChunkError) {
      this.reloadTimeout = setTimeout(
        () => window.location.reload(),
        TIMEOUTS.CHUNK_ERROR_RELOAD
      );
    }
  }

  componentWillUnmount() {
    if (this.reloadTimeout) clearTimeout(this.reloadTimeout);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-neutral-100">
          <h1 className="text-xl font-semibold text-neutral-800 mb-2">Something went wrong</h1>
          <p className="text-neutral-600 mb-4">{this.state.error?.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
