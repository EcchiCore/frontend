// D:\sever\nextjs\src\app\[locale]\page.tsx
import Home from './home/page'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  return <Home params={resolvedParams} />
}