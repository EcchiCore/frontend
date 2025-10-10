import { Suspense } from "react"
import Results from "./components/Results"
import SearchControls from "./components/SearchControls"
import ResultsSkeleton from "./components/ResultsSkeleton"
import Navbar from "../components/Navbar"

export const metadata = {
  title: "เกม | ChanomHub",
  description: "ค้นหาและสำรวจเกมที่คุณชื่นชอบ",
}

export const experimental_ppr = true
export const revalidate = 3600

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function GamesPage({ searchParams }: PageProps) {
  const params = searchParams

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">


          <section className="space-y-6">
            <SearchControls />

            <Suspense fallback={<ResultsSkeleton />}>
              <Results searchParams={params} />
            </Suspense>
          </section>
        </div>
      </div>
    </>
  )
}
