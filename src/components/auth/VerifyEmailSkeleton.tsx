export default function VerifyEmailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md shadow-xl border-0 bg-white rounded-lg p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="w-3/4 h-6 bg-blue-100 rounded animate-pulse"></div>
          <div className="w-1/2 h-4 bg-blue-100 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="w-full h-4 bg-blue-100 rounded animate-pulse"></div>
          <div className="w-3/4 h-4 bg-blue-100 rounded animate-pulse"></div>
          <div className="w-1/2 h-4 bg-blue-100 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-10 bg-blue-200 rounded animate-pulse"></div>
          <div className="w-full h-10 bg-blue-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}