export default function ResultsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="bg-muted/50 animate-pulse w-10 h-10 rounded-lg"></div>
        <div className="space-y-2">
          <div className="bg-muted/50 animate-pulse w-32 h-7 rounded"></div>
          <div className="bg-muted/50 animate-pulse w-24 h-4 rounded"></div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="bg-muted/50 animate-pulse w-full h-56"></div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 animate-pulse w-3/4 h-6 rounded"></div>
              <div className="bg-muted/50 animate-pulse w-full h-4 rounded"></div>
              <div className="bg-muted/50 animate-pulse w-2/3 h-4 rounded"></div>
              <div className="flex gap-2">
                <div className="bg-muted/50 animate-pulse w-16 h-6 rounded-full"></div>
                <div className="bg-muted/50 animate-pulse w-16 h-6 rounded-full"></div>
              </div>
              <div className="border-t border-border/30 pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted/50 animate-pulse w-8 h-8 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="bg-muted/50 animate-pulse w-24 h-4 rounded"></div>
                    <div className="bg-muted/50 animate-pulse w-16 h-3 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center gap-2 justify-center pt-12 border-t border-border/30">
        <div className="px-6 py-3 rounded-lg bg-muted/50 animate-pulse w-32 h-12"></div>
        <div className="px-4 py-3 rounded-lg bg-muted/50 animate-pulse w-12 h-12"></div>
        <div className="px-4 py-3 rounded-lg bg-muted/50 animate-pulse w-12 h-12"></div>
        <div className="px-6 py-3 rounded-lg bg-muted/50 animate-pulse w-32 h-12"></div>
      </div>
    </div>
  )
}
