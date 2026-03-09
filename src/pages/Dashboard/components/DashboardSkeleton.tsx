export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 h-32 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-gray-100 border border-gray-100 min-h-[320px] animate-pulse" />
          <div className="rounded-2xl bg-gray-100 border border-gray-100 min-h-[320px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
