import { Metadata } from "next";
import GameSearchPage from "./GameSearchPage";

interface GameResult {
  title: string;
  version: string;
  url: string;
  description: string;
  site: string;
  tags: string[] | null;
  metadata: { platforms?: string; [key: string]: any };
  score: number;
  extracted_at: string;
  image_urls: string[] | null;
}

interface SearchResponse {
  query: string;
  results: GameResult[];
  total: number;
}

interface SearchPageProps {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ q?: string; site?: string }>;
}

export async function generateMetadata({
                                         searchParams,
                                       }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams; // Await searchParams
  const query = resolvedSearchParams.q || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chanomhub.online";

  return {
    title: query ? `ค้นหา "${query}" - Chanom` : "ค้นหาเกม - Chanom",
    description: query
      ? `ผลการค้นหาเกม "${query}" จาก Chanom`
      : "ค้นหาเกมยอดนิยมและใหม่ล่าสุดบน Chanom",
    keywords: `ค้นหาเกม, ${query}, Chanom, LewdZone`,
    openGraph: {
      title: query ? `ค้นหา "${query}" - Chanom` : "ค้นหาเกม - Chanom",
      description: query
        ? `ผลการค้นหาเกม "${query}" จาก Chanom`
        : "ค้นหาเกมยอดนิยมและใหม่ล่าสุดบน Chanom",
      type: "website",
      images: [{ url: `${siteUrl}/images/chanom-logo.jpg`, width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams; // Await searchParams
  const q = resolvedSearchParams.q || "";
  const site = resolvedSearchParams.site || "lewdzone.com";
  let initialData: SearchResponse = { query: q, results: [], total: 0 };

  if (q) {
    try {
      const params = new URLSearchParams({ q, site, limit: "10" });
      const response = await fetch(`http://${process.env.SEARXNG_URL}/search?${params}`, {
        cache: "no-store",
      });
      if (response.ok) {
        initialData = await response.json();
      }
    } catch (err) {
      console.error("Server fetch error:", err);
    }
  }

  return <GameSearchPage initialData={initialData} />;
}