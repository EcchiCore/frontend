import ChanomhubSearch, { GameResult } from "./GameSearchPage";
import { searchArticlesServer } from "@/lib/qdrant-server";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  let initialResults: GameResult[] = [];

  if (query) {
    const points = await searchArticlesServer(query);
    initialResults = points.map(point => ({
      title: point.payload.title || "No Title",
      version: point.payload.version || "1.0.0",
      url: point.payload.url || "#",
      description: point.payload.description || "No description available",
      site: point.payload.site || "chanomhub.com",
      tags: point.payload.tags || [],
      metadata: point.payload.metadata || {},
      score: point.score || 0,
      extracted_at: point.payload.extracted_at || new Date().toISOString(),
      image_urls: point.payload.image_urls || null,
    }));
  }

  return <ChanomhubSearch initialQuery={query} initialResults={initialResults} />;
}
