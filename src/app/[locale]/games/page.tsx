import { Suspense } from "react"
import Results from "./components/Results"
import SearchControls from "./components/SearchControls"
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
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DonationCTA />
          <section className="space-y-6">
            <SearchControls />

            <Suspense fallback={<ResultsSkeleton />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </section>

          <aside className="lg:w-[320px] mx-auto w-full">
            <DonationSidebarWidget />
          </aside>
        </div>
      </div>
    </>
  )
}