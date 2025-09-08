// D:\sever\nextjs\src\app\[locale]\page.tsx
import Home from './home/page'

export default function Page({ params }: { params: { locale: string } }) {
  return <Home params={params} />;
}

