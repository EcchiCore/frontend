// ===============================
// app/games/page.tsx (Route entry with PPR + streaming)
// ===============================
import { Suspense } from "react";
import Results from "./components/Results";
import SearchControls from "./components/SearchControls";
import ResultsSkeleton from "./components/ResultsSkeleton";

export const metadata = {
  title: "Games | ChanomHub",
};

// ✅ Opt-in Partial Prerendering for this segment
export const experimental_ppr = true;

// Optional: ensuring the outer shell is static-friendly
export const revalidate = 3600; // cache shell for 1 hour (dynamic holes still stream)

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function GamesPage({ searchParams }: PageProps) {
  // Await the searchParams since it's a Promise with PPR
  const params = await searchParams;

  // Note: static shell (header/filters), dynamic list streams inside Suspense
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Games</h1>
      </header>

      {/* Client-side filters that update the URL (and thus stream new results) */}
      <SearchControls />

      <Suspense fallback={<ResultsSkeleton />}> 
        {/* Server Component that fetches using current search params */}
        <Results searchParams={params} />
      </Suspense>
    </div>
  );
}