import HomeCarousel from './components/HomeCarousel';
import SponsoredArticles from './components/SponsoredArticles';
import FeatureStrip from './components/FeatureStrip';
import TabbedGameLists from './components/TabbedGameLists';
import SearchControlsWrapper from '@/app/[locale]/games/components/SearchControlsWrapper';
import SidebarFilters from '@/app/[locale]/games/components/SidebarFilters';
import Results from '@/app/[locale]/games/components/Results';
import ResultsSkeleton from '@/app/[locale]/games/components/ResultsSkeleton';
import DonationSidebarWidget from '@/components/DonationSidebarWidget';
import DonationCTA from '@/components/DonationCTA';
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

// Fields ที่ต้องใช้สำหรับ card display เท่านั้น (ไม่ดึง body → ลด memory)
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
      const [carouselData, sponsoredData, rpgData] = await Promise.all([
        sdk.articles.getAll({ limit: 5, status: 'PUBLISHED', fields: HOME_CARD_FIELDS }),
        sdk.sponsoredArticles.getAll().catch(() => []),
        sdk.articles.getAll({ limit: 50, status: 'PUBLISHED', fields: HOME_CARD_FIELDS, filter: { tag: 'rpg' } }).catch(() => []),
      ]);
      return {
        carousel: carouselData || [],
        sponsored: sponsoredData || [],
        rpg: rpgData || [],
      };
    } catch (error) {
      console.error('Error fetching home page data:', error);
      return { carousel: [], sponsored: [], rpg: [] };
    }
  },
  ['home-page-data-v2'],
  { revalidate: 300 } // 5 minutes
);

// ห่อด้วย singleFlight ป้องกัน thundering herd
const getCachedHomeData = (token?: string) =>
  singleFlight(`home-data-${token ? 'auth' : 'guest'}`, () => _getCachedHomeData(token));

async function getAuthToken() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

const getStats = (t: any) => [
  { label: t('statsMembers'),  val: '45,231', color: '' },
  { label: t('statsOnline'), val: '892',    color: 'text-green-500' },
  { label: t('statsPosts'),  val: '123k',   color: '' },
  { label: t('statsToday'),  val: '234',    color: 'text-primary' },
];

export default async function HomePage({ params, searchParams }: PageProps) {
  const token = await getAuthToken();
  const homeData = await getCachedHomeData(token);
  
  // Resolve locale translations
  const resolvedParams = await params;
  const t = await getTranslations('homePage.HomePage');
  const stats = getStats(t);

  const rpgGames = homeData.rpg || [];

  const getMixGames = (games: any[], secondaryTag: string) => {
    const matching = games.filter(g => g.tags?.some((t: any) => t.name.toLowerCase() === secondaryTag));
    if (matching.length >= 8) {
      return matching.slice(0, 8);
    }
    const remaining = games.filter(g => !matching.some(m => m.id === g.id));
    return [...matching, ...remaining].slice(0, 8);
  };

  const mixRpgFantasy = getMixGames(rpgGames, 'fantasy');
  const mixRpgAdventure = getMixGames(rpgGames, 'adventure');
  const mixRpgStoryRich = getMixGames(rpgGames, 'story rich');

  return (
    <div className="min-h-screen bg-background">
      <main className="bg-background">
        <h1 className="sr-only">ChanomHub - Adult Gaming Hub</h1>

        {/* Sponsored strip */}
        <SponsoredArticles articles={homeData.sponsored} />

        {/* Hero carousel */}
        <HomeCarousel articles={homeData.carousel} loading={false} />

        {/* Top Content: Stats, Donation CTA, Feature Strip, Tabbed Mixes */}
        <div className="container mx-auto px-3 pt-3 pb-6 max-w-5xl">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {stats.map(({ label, val, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl px-2 py-2.5 text-center">
                <div className={`text-sm font-bold leading-tight ${color || 'text-foreground'}`}>{val}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Donation CTA */}
          <div className="mb-5">
            <DonationCTA />
          </div>

          {/* Other tags you may like */}
          <FeatureStrip />

          {/* Tag mixes */}
          <TabbedGameLists
            mixRpgFantasy={mixRpgFantasy}
            mixRpgAdventure={mixRpgAdventure}
            mixRpgStoryRich={mixRpgStoryRich}
          />

          {/* Centered Search Bar */}
          <div id="catalog" className="max-w-2xl mx-auto my-8 pt-4">
            <SearchControlsWrapper />
          </div>
        </div>

        {/* Catalog Section (Sidebar + Results) with a wider max-w-7xl layout */}
        <div className="container mx-auto px-4 pb-16 max-w-7xl">
          <div className="flex gap-6 mt-4">
            {/* Sidebar — desktop only, filters only */}
            <aside className="hidden lg:flex flex-col w-[220px] shrink-0 gap-4">
              <SidebarFilters />
              <DonationSidebarWidget />
            </aside>

            {/* Main content */}
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
