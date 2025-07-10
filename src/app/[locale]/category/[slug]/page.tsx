import { Metadata } from 'next';
import DynamicFilterPage, { generateMetadata as generateDynamicMetadata } from '../../components/DynamicFilterPage/DynamicFilterPage';

interface CategoryPageParams {
  slug: string;
  locale: string;
}

interface CategoryPageProps {
  params: Promise<CategoryPageParams>;
}

export async function generateStaticParams() {
  const categories = ['tutorials', 'news', 'reviews'];
  const locales = ['en', 'th'];

  return locales.flatMap(locale =>
    categories.map(category => ({
      slug: category,
      locale,
    }))
  );
}

export async function generateMetadata({ params }: { params: Promise<CategoryPageParams> }): Promise<Metadata> {
  return generateDynamicMetadata({ params, filterType: 'category' });
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <DynamicFilterPage params={params} filterType="category" hasRss={false} />;
}