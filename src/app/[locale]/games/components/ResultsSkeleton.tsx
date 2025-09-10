// ===============================
// app/games/components/ResultsSkeleton.tsx
// ===============================

export default function ResultsSkeleton() {
  return (
    <div className="space-y-4 ">
      <div className="bg-muted animate-pulse w-32 h-6 rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border">
            <div className="bg-muted animate-pulse w-full h-48"></div>
            <div className="p-4 space-y-2">
              <div className="bg-muted animate-pulse w-3/4 h-6 rounded"></div>
              <div className="bg-muted animate-pulse w-1/2 h-4 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 justify-center pt-2">
        <div className="px-3 py-1 rounded-full border bg-muted animate-pulse w-20"></div>
        <div className="text-sm opacity-70 bg-muted animate-pulse w-24 h-6 rounded"></div>
        <div className="px-3 py-1 rounded-full border bg-muted animate-pulse w-20"></div>
      </div>
    </div>
  );
}