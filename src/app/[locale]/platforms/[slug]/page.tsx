import { Metadata } from 'next';
import DynamicFilterPage, { generateMetadata as generateDynamicMetadata } from '../../components/DynamicFilterPage/DynamicFilterPage';

interface PlatformPageParams {
  slug: string;
  locale: string;
}

interface PlatformPageProps {
  params: Promise<PlatformPageParams>;
}

export async function generateStaticParams() {
  const platforms = ['Windows', 'Android', 'Linux', 'macOS'];
  const locales = ['en', 'th'];

  return locales.flatMap(locale =>
    platforms.map(platform => ({
      slug: platform,
      locale,
    }))
  );
}

export async function generateMetadata({ params }: { params: Promise<PlatformPageParams> }): Promise<Metadata> {
  return generateDynamicMetadata({ params, filterType: 'platforms' });
}

export default function PlatformPage({ params }: PlatformPageProps) {
  return <DynamicFilterPage params={params} filterType="platforms" hasRss={true} />;
}