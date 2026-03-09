import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes/routes';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingFallback from './components/shared/LoadingFallback';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
