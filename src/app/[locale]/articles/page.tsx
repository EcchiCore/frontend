import { Suspense } from "react";
import ArticleResults from "./components/ArticleResults";
import SidebarFilters from "@/app/[locale]/games/components/SidebarFilters";
import ResultsSkeleton from "@/app/[locale]/games/components/ResultsSkeleton";
import SearchControlsWrapper from "@/app/[locale]/games/components/SearchControlsWrapper";
import DonationSidebarWidget from "@/components/DonationSidebarWidget";
import DonationCTA from "@/components/DonationCTA";

import { getTranslations } from "next-intl/server";
import { getValidLocale, siteUrl, defaultLocale } from "@/utils/localeUtils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = getValidLocale(resolvedParams.locale);
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "GamesPage" }); // Reusing metadata

  const canonicalUrl = locale === defaultLocale
    ? `${siteUrl}/articles`
    : `${siteUrl}/${locale}/articles`;

  return {
    title: `Articles & Reviews - ChanomHub`,
    description: `Read game reviews, installation walkthroughs, and mod details from the ChanomHub community.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${siteUrl}/articles`,
        'th': `${siteUrl}/th/articles`,
        'x-default': `${siteUrl}/articles`,
      },
    },
  };
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ArticlesIndexPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-[#1b2838] text-[#c1dbf4] pb-12">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <DonationCTA />

        {/* Search bar ── visible on all breakpoints */}
        <div className="mt-6">
          <Suspense fallback={
            <div className="h-12 bg-[#171a21]/50 border border-[#2a475e]/40 rounded-sm animate-pulse" />
          }>
            <SearchControlsWrapper />
          </Suspense>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          {/* Sidebar ── filters */}
          <aside className="w-full lg:w-[240px] shrink-0 flex flex-col gap-4">
            <Suspense fallback={<div className="h-48 bg-[#171a21]/30 rounded-sm border border-[#2a475e]/20" />}>
              <SidebarFilters />
            </Suspense>
            <DonationSidebarWidget />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={<ResultsSkeleton />}>
              <ArticleResults searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
