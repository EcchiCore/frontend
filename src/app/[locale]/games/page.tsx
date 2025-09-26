// ===============================
// app/games/page.tsx (Route entry with PPR + streaming)
// ===============================
import { Suspense } from "react";
import Results from "./components/Results";
import SearchControls from "./components/SearchControls";
import ResultsSkeleton from "./components/ResultsSkeleton";
import Navbar from "../components/Navbar";

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
    <>
      <Navbar />
      <div className=" mx-auto px-4 py-6 space-y-6 bg-background ">
        <section className="container mx-auto">
        {/* Client-side filters that update the URL (and thus stream new results) */}
        <SearchControls />

        <Suspense fallback={<ResultsSkeleton />}> 
          {/* Server Component that fetches using current search params */}
          <Results searchParams={params} />
        </Suspense>
        </section>
      </div>
    </>
  );
}
