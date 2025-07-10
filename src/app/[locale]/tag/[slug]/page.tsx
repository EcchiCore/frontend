import { Metadata } from 'next';
import DynamicFilterPage, { generateMetadata as generateDynamicMetadata } from '../../components/DynamicFilterPage/DynamicFilterPage';

interface TagPageParams {
  slug: string;
  locale: string;
}

interface TagPageProps {
  params: Promise<TagPageParams>;
}

// ลบ generateStaticParams ออกไปเลย
// เมื่อไม่มี generateStaticParams Next.js จะใช้ dynamic rendering
// หรือ on-demand static generation ตามการตั้งค่า

export async function generateMetadata({ params }: { params: Promise<TagPageParams> }): Promise<Metadata> {
  return generateDynamicMetadata({ params, filterType: 'tag' });
}

export default function TagPage({ params }: TagPageProps) {
  return <DynamicFilterPage params={params} filterType="tag" hasRss={true} />;
}