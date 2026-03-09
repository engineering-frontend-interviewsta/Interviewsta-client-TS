export default function LoadingFallback() {
  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ minHeight: '100vh' }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="text-center">
        <div
          className="inline-block w-12 h-12 border-4 border-solid border-current border-t-transparent rounded-full animate-spin"
          style={{ width: '3rem', height: '3rem' }}
        />
        <p className="mt-3 text-neutral-500">Loading…</p>
      </div>
    </div>
  );
}
