// D:\sever\nextjs\src\app\[locale]\page.tsx
import Home, { generateMetadata as generateHomeMetadata } from './home/page'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return generateHomeMetadata({ params: resolvedParams });
}

export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  return <Home params={resolvedParams} searchParams={searchParams} />
}