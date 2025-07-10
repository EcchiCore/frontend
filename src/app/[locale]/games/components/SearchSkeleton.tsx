// app/games/components/SearchSkeleton.tsx
export default function SearchSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 flex space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
                <div className="h-6 bg-gray-200 rounded-full w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}