import HomeCarousel from './components/HomeCarousel';
import SponsoredArticles from './components/SponsoredArticles';
import TagPills from './components/TagPills';
import SearchControlsWrapper from '@/app/[locale]/games/components/SearchControlsWrapper';
import SidebarFilters from '@/app/[locale]/games/components/SidebarFilters';
import Results from '@/app/[locale]/games/components/Results';
import ResultsSkeleton from '@/app/[locale]/games/components/ResultsSkeleton';
import DonationSidebarWidget from '@/components/DonationSidebarWidget';
import { generatePageMetadata } from '@/utils/metadataUtils';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/app/[locale]/lib/navigation';
import { createChanomhubClient } from '@chanomhub/sdk';
import type { ArticleField } from '@chanomhub/sdk';
import { unstable_cache } from 'next/cache';
import { singleFlight } from '@/lib/cache/singleFlight';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ locale: string }> | { locale: string }
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: { params: { locale?: string } }) {
  const locale = (params?.locale || 'en') as (typeof locales)[number];
  const t = await getTranslations({ locale, namespace: 'Home' });
  return generatePageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(','),
    contentPath: 'home',
  });
}

// Fields for card display only (no body → less memory)
const HOME_CARD_FIELDS: ArticleField[] = [
  'id', 'title', 'slug', 'description',
  'mainImage', 'coverImage', 'backgroundImage',
  'author', 'tags', 'platforms', 'categories',
  'favoritesCount', 'createdAt', 'updatedAt',
  'price', 'isPaid', 'ver',
];

const _getCachedHomeData = unstable_cache(
  async (token?: string) => {
    try {
      const sdk = createChanomhubClient({ token });
      const [carouselData, sponsoredData] = await Promise.all([
        sdk.articles.getAll({ limit: 5, status: 'PUBLISHED', fields: HOME_CARD_FIELDS }),
        sdk.sponsoredArticles.getAll().catch(() => []),
      ]);
      return {
        carousel: carouselData || [],
        sponsored: sponsoredData || [],
      };
    } catch (error) {
      console.error('Error fetching home page data:', error);
      return { carousel: [], sponsored: [] };
    }
  },
  ['home-page-data-v2'],
  { revalidate: 300 }
);

const getCachedHomeData = (token?: string) =>
  singleFlight(`home-data-${token ? 'auth' : 'guest'}`, () => _getCachedHomeData(token));

async function getAuthToken() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const token = await getAuthToken();
  const homeData = await getCachedHomeData(token);

  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-background">
      <main>
        <h1 className="sr-only">ChanomHub - Adult Gaming Hub</h1>

        {/* 1. Sponsored strip */}
        <SponsoredArticles articles={homeData.sponsored} />

        {/* 2. Hero carousel — full-bleed cinematic */}
        <HomeCarousel articles={homeData.carousel} loading={false} />

        {/* 3. Tag pills — browse by genre */}
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <TagPills />
        </div>

        {/* 4. Catalog — search + sidebar + results */}
        <div id="catalog" className="container mx-auto px-4 pb-16 max-w-7xl">
          {/* Centered search bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchControlsWrapper />
          </div>

          <div className="flex gap-6">
            {/* Sidebar — desktop only */}
            <aside className="hidden lg:flex flex-col w-[220px] shrink-0 gap-4">
              <SidebarFilters />
              <DonationSidebarWidget />
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              <Suspense fallback={<ResultsSkeleton />}>
                <Results searchParams={searchParams} />
              </Suspense>
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}
