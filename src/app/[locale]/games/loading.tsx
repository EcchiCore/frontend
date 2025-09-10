// ===============================
// app/games/loading.tsx (PPR will serve shell instantly; this is a bonus for nav)
// ===============================
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="h-8 w-40 rounded-2xl animate-pulse" />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border animate-pulse" />
        ))}
      </div>
    </div>
  );
}