import { Inter } from 'next/font/google';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navbar from '../components/Navbar';
import FeaturedPosts from './components/FeaturedPosts';
import HomeCarousel from './components/HomeCarousel';
import CategoryGrid from './components/CategoryGrid';
import { generatePageMetadata } from '@/utils/metadataUtils';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/app/[locale]/lib/navigation';
import { getActiveEventTheme } from '@/lib/event-theme';
import { fetchArticles } from '@/lib/api';
import { fetchPlatforms, fetchTags } from '@/app/[locale]/lib/searchUtils';
import ChristmasCountdown from './components/ChristmasCountdown';
import DiscordWidget from './components/DiscordWidget';


// Font configuration
const inter = Inter({ subsets: ['latin'] });



export async function generateMetadata({ params }: { params: { locale?: string } }) {
  const locale = (params?.locale || 'en') as (typeof locales)[number]; // Cast locale
  const t = await getTranslations({ locale, namespace: 'Home' });

  return generatePageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: ['Chanomhub', 'เว็บบอร์ด', 'ถาม-ตอบ', 'ชุมชนออนไลน์', 'ข่าวสาร', 'เกมผู้ใหญ่', 'NSFW'],
    contentPath: 'home',
  });
}

// Server-side data fetching
async function fetchHomeData() {
  try {
    const [carouselData, featuredData, latestData, platformsData, tagsData] = await Promise.all([
      fetchArticles({ limit: '3', status: 'PUBLISHED' }),
      fetchArticles({ platform: 'windows', status: 'PUBLISHED', limit: '6' }),
      fetchArticles({ status: 'PUBLISHED', limit: '10' }),
      fetchPlatforms(),
      fetchTags(),
    ]);

    return {
      carousel: carouselData.items || [],
      featured: featuredData.items || [],
      latest: latestData.items || [],
      platforms: platformsData || [],
      tags: tagsData || [],
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return { carousel: [], featured: [], latest: [], platforms: [], tags: [] };
  }
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const homeData = await fetchHomeData();



  return (
    <div className={`min-h-screen bg-background ${inter.className}`}>
      <Navbar />

      <main className="bg-background">
        <section className="border-b border-border py-2 px-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <ChristmasCountdown />
            </div>
          </div>
        </section>

        <HomeCarousel articles={homeData.carousel} loading={false} />

        <div className="grid lg:grid-cols-5 gap-3 container mx-auto px-2 pb-4">
          {/* Main Content */}
          <div className="lg:col-span-4">
            {/* Compact Tabs Navigation */}
            <Tabs defaultValue="featured" className="mb-3">
              <div className="border-b border-border">
                <TabsList className="grid w-full grid-cols-4 bg-transparent h-8">
                  <TabsTrigger
                    value="featured"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                  >
                    แนะนำ
                  </TabsTrigger>
                  <TabsTrigger
                    value="latest"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                  >
                    ล่าสุด
                  </TabsTrigger>
                  <TabsTrigger
                    value="trending"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                  >
                    ยอดนิยม
                  </TabsTrigger>
                  <TabsTrigger
                    value="myFeed"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                  >
                    ฟีดของฉัน
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="featured" className="space-y-3 mt-3">
                <FeaturedPosts posts={homeData.featured} loading={false} />
                {/* Category Grid with 4 columns */}
                <CategoryGrid />
              </TabsContent>

              <TabsContent value="latest" className="space-y-3 mt-3">
                <FeaturedPosts posts={homeData.latest} loading={false} />
                {/* Category Grid with 4 columns */}
                <CategoryGrid />
              </TabsContent>

              <TabsContent value="trending" className="space-y-3 mt-3">
                <div className="text-xs text-muted-foreground px-2">กระทู้ที่ได้รับความสนใจมากที่สุดในวันนี้</div>
              </TabsContent>

              <TabsContent value="myFeed" className="space-y-3 mt-3">
                <div className="text-xs text-muted-foreground px-2">เข้าสู่ระบบเพื่อดูกระทู้ที่คุณติดตาม</div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Compact Sidebar */}
          <div className="space-y-3">
            {/* Platform Card */}
            {/* <CategoriesCard platforms={homeData.platforms} /> */}

            {/* Stats Widget */}
            <div className="border border-border rounded p-2 bg-card text-foreground">
              <div className="text-xs font-semibold mb-2 px-1 flex items-center space-x-2">
                <div className="w-0.5 h-4 bg-primary"></div>
                <span>สถิติ</span>
              </div>
              <div className="space-y-1 text-xs px-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">สมาชิก:</span>
                  <span className="font-medium">45,231</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ออนไลน์:</span>
                  <span className="font-medium text-green-600">892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">กระทู้ทั้งหมด:</span>
                  <span className="font-medium">123,456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">โพสต์วันนี้:</span>
                  <span className="font-medium text-primary">234</span>
                </div>
              </div>
            </div>

            {/* Compact Trending Tags */}
            {/* <div className="border border-border rounded p-2 bg-card">
              <div className="text-xs font-semibold mb-2 px-1 flex items-center space-x-2">
                <div className="w-0.5 h-4 bg-primary"></div>
                <span>แท็กยอดนิยม</span>
              </div>
              <div className="space-y-0.5">
                {homeData.tags.slice(0, 10).map((tag: any) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between px-1.5 py-1 hover:bg-accent/50 rounded cursor-pointer transition-colors text-xs group"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      #{tag.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">
                      {(tag.articleCount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Discord Widget */}
            <DiscordWidget />
          </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="bg-muted/30 border-t border-border py-3 mt-8">
        <div className="container mx-auto px-2">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs text-muted-foreground">
            <p>
              &copy; 2025 <span className="text-primary font-semibold">ChanomHub</span>
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">นโยบาย</a>
              <a href="#" className="hover:text-primary transition-colors">เงื่อนไข</a>
              <a href="#" className="hover:text-primary transition-colors">ติดต่อ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}