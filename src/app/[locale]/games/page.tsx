import { Suspense } from "react"
import Results from "./components/Results"
import SearchControls from "./components/SearchControls"
import ResultsSkeleton from "./components/ResultsSkeleton"
import Navbar from "../components/Navbar"

export const metadata = {
  title: "เกม | ChanomHub",
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
          <section className="space-y-6">
            <SearchControls />

            <Suspense fallback={<ResultsSkeleton />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </section>
        </div>
      </div>
    </>
  )
}