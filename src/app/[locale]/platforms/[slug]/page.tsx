import { Metadata } from 'next';
import DynamicFilterPage, { generateMetadata as generateDynamicMetadata } from '../../components/DynamicFilterPage/DynamicFilterPage';

interface PlatformPageParams {
  slug: string;
  locale: string;
}

interface PlatformPageProps {
  params: Promise<PlatformPageParams>;
}

// ลบ generateStaticParams ออกไปเลย
// เมื่อไม่มี generateStaticParams Next.js จะใช้ dynamic rendering
// หรือ on-demand static generation ตามการตั้งค่า

export async function generateMetadata({ params }: { params: Promise<PlatformPageParams> }): Promise<Metadata> {
  return generateDynamicMetadata({ params, filterType: 'platforms' });
}

export default function PlatformPage({ params }: PlatformPageProps) {
  return <DynamicFilterPage params={params} filterType="platforms" hasRss={true} />;
}