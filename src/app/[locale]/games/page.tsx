import { Suspense } from "react"
import Results from "./components/Results"
import SidebarFilters from "./components/SidebarFilters"
import ResultsSkeleton from "./components/ResultsSkeleton"
import DonationSidebarWidget from "@/components/DonationSidebarWidget"
import DonationCTA from "@/components/DonationCTA"

import { getTranslations } from "next-intl/server"
import { locales } from "@/app/[locale]/lib/navigation"
import { getValidLocale, siteUrl, defaultLocale } from "@/utils/localeUtils"

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await params;
  const locale = getValidLocale(resolvedParams.locale);
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "GamesPage" })
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page;
  const category = resolvedSearchParams.category;

  const canonicalUrl = locale === defaultLocale
    ? `${siteUrl}/games`
    : `${siteUrl}/${locale}/games`;

  return {
    title: `${t("clubTitle")}${category ? ` - ${category}` : ""}${page ? ` (Page ${page})` : ""}`,
    description: `${t("clubDescription")}${category ? ` in ${category}` : ""}${page ? ` - Page ${page}` : ""}.` + " Browse our collection of adult games and visual novels.",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${siteUrl}/games`,
        'th': `${siteUrl}/th/games`,
        'x-default': `${siteUrl}/games`,
      },
    },
  }
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GamesPage({ searchParams }: PageProps) {
  const t = await getTranslations("GamesPage")
  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <h1 className="sr-only">{t("clubH1")}</h1>
          <DonationCTA />

          <div className="flex gap-6 mt-4">
            {/* Sidebar — desktop only, filters only (no search bar) */}
            <aside className="hidden lg:flex flex-col w-[220px] shrink-0 gap-4">
              <SidebarFilters />
              <DonationSidebarWidget />
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <Suspense fallback={<ResultsSkeleton />}>
                <Results searchParams={searchParams} />
              </Suspense>
            </main>
          </div>

          {/* Mobile: Donation widget below grid */}
          <div className="lg:hidden mt-6">
            <DonationSidebarWidget />
          </div>
        </div>
      </div>
    </>
  )
}
