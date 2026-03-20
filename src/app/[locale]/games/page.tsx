import { Suspense } from "react"
import Results from "./components/Results"
import SidebarFilters from "./components/SidebarFilters"
import ResultsSkeleton from "./components/ResultsSkeleton"
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

          <div className="flex gap-6 mt-6">
            {/* Sidebar */}
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
