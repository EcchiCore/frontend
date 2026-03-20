import { Suspense } from "react"
import Results from "./components/Results"
import SidebarFilters from "./components/SidebarFilters"
import ResultsSkeleton from "./components/ResultsSkeleton"
import SearchControlsWrapper from "./components/SearchControlsWrapper"
import Navbar from "../components/Navbar"
import DonationSidebarWidget from "@/components/DonationSidebarWidget"
import DonationCTA from "@/components/DonationCTA"

export const metadata = {
  title: "เกมคลับ",
  description: "ค้นหาและสำรวจเกมที่คุณชื่นชอบ",
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GamesPage({ searchParams }: PageProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <DonationCTA />

          {/* Search bar — visible on ALL breakpoints */}
          <div className="mt-6">
            <Suspense fallback={
              <div className="h-12 bg-card border border-border/50 rounded-lg animate-pulse" />
            }>
              <SearchControlsWrapper />
            </Suspense>
          </div>

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
