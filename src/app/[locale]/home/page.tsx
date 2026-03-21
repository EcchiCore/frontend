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
import { unstable_cache } from 'next/cache';

export async function generateMetadata({ params }: { params: { locale?: string } }) {
  const locale = (params?.locale || 'en') as (typeof locales)[number];
  const t = await getTranslations({ locale, namespace: 'Home' });
  return generatePageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: ['Chanomhub', 'เว็บบอร์ด', 'ถาม-ตอบ', 'ชุมชนออนไลน์', 'ข่าวสาร', 'เกมผู้ใหญ่', 'NSFW'],
    contentPath: 'home',
  });
}

const getCachedHomeData = unstable_cache(
  async (token?: string) => {
    try {
      const sdk = createChanomhubClient({ token });
      const [carouselData, featuredData, latestData, windowsData, sponsoredData] = await Promise.all([
        sdk.articles.getAll({ limit: 3, status: 'PUBLISHED' }),
        sdk.articles.getByPlatform('windows', { limit: 16 }),
        sdk.articles.getAll({ limit: 10, status: 'PUBLISHED' }),
        sdk.articles.getByPlatform('windows', { limit: 10 }),
        sdk.sponsoredArticles.getAll().catch(() => []),
      ]);
      return {
        carousel: carouselData || [],
        featured: featuredData || [],
        latest: latestData || [],
        windows: windowsData || [],
        sponsored: sponsoredData || [],
      };
    } catch (error) {
      console.error('Error fetching home page data:', error);
      return { carousel: [], featured: [], latest: [], windows: [], sponsored: [] };
    }
  },
  ['home-page-data'],
  { revalidate: 60 }
);

async function getAuthToken() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
  } catch {
    return undefined;
  }
}

const stats = [
  { label: 'สมาชิก',  val: '45,231', color: '' },
  { label: 'ออนไลน์', val: '892',    color: 'text-green-500' },
  { label: 'กระทู้',  val: '123k',   color: '' },
  { label: 'วันนี้',  val: '234',    color: 'text-primary' },
];

export default async function HomePage({ params }: { params: { locale: string } }) {
  const token = await getAuthToken();
  const homeData = await getCachedHomeData(token);

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

          {/* Shelf: แนะนำ */}
          <GameShelf
            title="แนะนำสำหรับคุณ"
            posts={homeData.featured}
            href="/games"
          />

          {/* Shelf: กระทู้ล่าสุด */}
          <ArticleShelf
            title="กระทู้ล่าสุด"
            posts={homeData.latest}
            href="/articles"
          />

          {/* Shelf: เครื่องมือ */}
          <ToolsShelf />

          {/* Shelf: Windows */}
          <GameShelf
            title="🪟 ยอดนิยมบน Windows"
            posts={homeData.windows}
            href="/games?platform=windows"
          />

        </div>
      </main>
    </div>
  );
}
