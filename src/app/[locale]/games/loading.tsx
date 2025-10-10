export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero skeleton */}
        <section className="space-y-4 py-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-1 bg-muted/50 animate-pulse rounded-full"></div>
            <div className="space-y-3">
              <div className="h-12 w-64 bg-muted/50 animate-pulse rounded-lg"></div>
              <div className="h-6 w-96 bg-muted/50 animate-pulse rounded"></div>
            </div>
          </div>
        </section>

        {/* Search skeleton */}
        <div className="h-24 bg-card/50 border border-border/50 rounded-xl animate-pulse"></div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-96 rounded-xl border border-border/50 bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
