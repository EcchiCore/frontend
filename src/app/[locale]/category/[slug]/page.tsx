import { Metadata } from 'next';
import DynamicFilterPage, { generateMetadata as generateDynamicMetadata } from '../../components/DynamicFilterPage/DynamicFilterPage';

interface CategoryPageParams {
  slug: string;
  locale: string;
}

interface CategoryPageProps {
  params: Promise<CategoryPageParams>;
}

// ลบ generateStaticParams ออกไปเลย
// เมื่อไม่มี generateStaticParams Next.js จะใช้ dynamic rendering
// หรือ on-demand static generation ตามการตั้งค่า

export async function generateMetadata({ params }: { params: Promise<CategoryPageParams> }): Promise<Metadata> {
  return generateDynamicMetadata({ params, filterType: 'category' });
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <DynamicFilterPage params={params} filterType="category" hasRss={false} />;
}