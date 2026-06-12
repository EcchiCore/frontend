// D:\sever\nextjs\src\app\[locale]\page.tsx
import Home, { generateMetadata as generateHomeMetadata } from './home/page'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return generateHomeMetadata({ params: resolvedParams });
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  return <Home params={resolvedParams} />
}