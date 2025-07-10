import { Metadata } from 'next';
import DynamicFilterPage, { generateMetadata as generateDynamicMetadata } from '../../components/DynamicFilterPage/DynamicFilterPage';

interface TagPageParams {
  slug: string;
  locale: string;
}

interface TagPageProps {
  params: Promise<TagPageParams>;
}

export async function generateStaticParams() {
  const tags = ['beginner', 'advanced', 'tips'];
  const locales = ['en', 'th'];

  return locales.flatMap(locale =>
    tags.map(tag => ({
      slug: tag,
      locale,
    }))
  );
}

export async function generateMetadata({ params }: { params: Promise<TagPageParams> }): Promise<Metadata> {
  return generateDynamicMetadata({ params, filterType: 'tag' });
}

export default function TagPage({ params }: TagPageProps) {
  return <DynamicFilterPage params={params} filterType="tag" hasRss={true} />;
}