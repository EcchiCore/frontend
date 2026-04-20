import HomeCarousel from './components/HomeCarousel';
import SponsoredArticles from './components/SponsoredArticles';
import GameShelf from './components/GameShelf';
import ArticleShelf from './components/ArticleShelf';
import CategoryPills from './components/CategoryPills';
import ToolsShelf from './components/ToolsShelf';
import DonationCTA from '@/components/DonationCTA';
import { generatePageMetadata } from '@/utils/metadataUtils';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/app/[locale]/lib/navigation';
import { createChanomhubClient } from '@chanomhub/sdk';
import type { ArticleField } from '@chanomhub/sdk';
import { unstable_cache } from 'next/cache';
import { singleFlight } from '@/lib/cache/singleFlight';

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
      const [carouselData, featuredData, latestData, windowsData, androidData, sponsoredData] = await Promise.all([
        sdk.articles.getAll({ limit: 5, status: 'PUBLISHED', fields: HOME_CARD_FIELDS }),
        sdk.articles.getAll({ limit: 12, status: 'PUBLISHED', fields: HOME_CARD_FIELDS }),
        sdk.articles.getAll({ limit: 12, status: 'PUBLISHED', fields: HOME_CARD_FIELDS }),
        sdk.articles.getByPlatform('windows', { limit: 12 }),
        sdk.articles.getByPlatform('android', { limit: 12 }),
        sdk.sponsoredArticles.getAll().catch(() => []),
      ]);
      return {
        carousel: carouselData || [],
        featured: featuredData || [],
        latest: latestData || [],
        windows: windowsData || [],
        android: androidData || [],
        sponsored: sponsoredData || [],
      };
    } catch (error) {
      console.error('Error fetching home page data:', error);
      return { carousel: [], featured: [], latest: [], windows: [], android: [], sponsored: [] };
    }
  },
  ['home-page-data'],
  { revalidate: 300 } // 5 minutes
);

// ห่อด้วย singleFlight ป้องกัน thundering herd
// เมื่อ cache expired หลาย request พร้อมกัน → มีแค่ตัวเดียวที่ยิง API จริง
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

export default async function HomePage({ params }: { params: { locale: string } }) {
  const token = await getAuthToken();
  const homeData = await getCachedHomeData(token);
  const t = await getTranslations('homePage.HomePage');
  const stats = getStats(t);

  return (
    <div className="min-h-screen bg-background">
      <main className="bg-background">
        <h1 className="sr-only">ChanomHub - Adult Gaming Hub</h1>

        {/* Sponsored strip */}
        <SponsoredArticles articles={homeData.sponsored} />

        {/* Hero carousel */}
        <HomeCarousel articles={homeData.carousel} loading={false} />

        {/* Single-column full-width content */}
        <div className="container mx-auto px-3 pt-3 pb-12 max-w-5xl">

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

          {/* Category filter pills */}
          <CategoryPills />

          {/* Shelf: Recommended */}
          <GameShelf
            title={t('recommendedForYou')}
            posts={homeData.featured}
            href="/games"
          />

          {/* Shelf: Latest Posts */}
          <ArticleShelf
            title={t('latestPosts')}
            posts={homeData.latest}
            href="/articles"
          />

          {/* Shelf: Tools */}
          <ToolsShelf />

          {/* Shelf: Windows */}
          <GameShelf
            title={t('popularWindows')}
            posts={homeData.windows}
            href="/games?platform=windows"
          />

          {/* Shelf: Android */}
          <GameShelf
            title={t('popularAndroid')}
            posts={homeData.android}
            href="/games?platform=android"
          />

        </div>
      </main>
    </div>
  );
}
