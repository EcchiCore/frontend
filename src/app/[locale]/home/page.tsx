import { Inter } from 'next/font/google';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, TrendingUp, MessageSquare, Star, Ghost } from 'lucide-react';
import Navbar from '../components/Navbar';
import FeaturedPosts from './components/FeaturedPosts';
import HomeCarousel from './components/HomeCarousel';
import CategoriesCard from './components/CategoriesCard';
import { generatePageMetadata } from '@/utils/metadataUtils';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { locales } from '@/app/[locale]/lib/navigation';
import { getActiveEventTheme } from '@/lib/event-theme';

// Font configuration
const inter = Inter({ subsets: ['latin'] });

// Mock data for trending topics
const trendingTopics = [
  { name: "SEX", count: 1250 },
  { name: "Anime", count: 980 },
  { name: "Milk", count: 856 },
  { name: "Parody", count: 742 },
  { name: "CG", count: 698 },
];

// Metadata generation
export async function generateMetadata({ params }: { params: { locale?: string } }) {
  const locale = (params?.locale || 'en') as (typeof locales)[number]; // Cast locale
  const t = await getTranslations({ locale, namespace: 'Home' });

  return generatePageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: ['Chanomhub', 'เว็บบอร์ด', 'ถาม-ตอบ', 'ชุมชนออนไลน์', 'ข่าวสาร', 'เกมผู้ใหญ่', 'NSFW', ...trendingTopics.map(topic => topic.name)],
    contentPath: 'home',
  });
}
// Server-side data fetching
async function fetchHomeData(locale: string) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  try {
    const response = await fetch(`${baseUrl}/api/home`, {
      headers: {
        'Accept-Language': locale,
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch home page data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return { carousel: [], featured: [], latest: [] };
  }
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const homeData = await fetchHomeData(locale);
  const t = await getTranslations({ locale, namespace: 'homePage' });
  const activeEventTheme = getActiveEventTheme();
  const isHalloween = activeEventTheme?.id === 'halloween';
  const heroImage = activeEventTheme?.assets?.homeHeroImage;

  const backgroundGradient = isHalloween
    ? 'from-amber-100/80 via-background to-purple-200/40 dark:from-purple-950/60 dark:via-background dark:to-black'
    : 'from-slate-50 via-background to-slate-100';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} ${inter.className}`}>
      <Navbar />

      <main className="bg-background">
        <section className="relative overflow-hidden text-center py-16 px-4">
          {heroImage && (
            <div className="absolute inset-0">
              <Image
                src={heroImage}
                alt="Halloween celebration"
                fill
                priority
                className="object-cover opacity-70 dark:opacity-60"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
            </div>
          )}
          <div className="relative">
            {isHalloween && (
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/40 bg-primary/10 px-6 py-2 text-primary shadow-sm backdrop-blur-sm">
                <Ghost className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">
                  Spooky Season Special
                </span>
              </div>
            )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent pb-2 drop-shadow-lg">
            {t('welcomeTo')}<span className="text-foreground">{t('hub')}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>
          {isHalloween && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-secondary-foreground/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              {t('seasonalMessage', {
                defaultMessage: 'ร่วมฉลองฮาโลวีนกับภารกิจล่าคอนเทนต์สุดพิเศษตลอดเดือนตุลาคม!',
              })}
            </p>
          )}
          </div>
        </section>

        <HomeCarousel articles={homeData.carousel} loading={false} />

        <div className="grid lg:grid-cols-4 gap-8 container mx-auto px-4 pb-16">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Enhanced Tabs Navigation */}
            <Tabs defaultValue="featured" className="mb-8">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/50 shadow-sm">
                <TabsList className="grid w-full grid-cols-4 bg-transparent h-12">
                  <TabsTrigger 
                    value="featured" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                  >
                    แนะนำ
                  </TabsTrigger>
                  <TabsTrigger 
                    value="latest"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                  >
                    ล่าสุด
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                  >
                    ยอดนิยม
                  </TabsTrigger>
                  <TabsTrigger 
                    value="myFeed"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                  >
                    ฟีดของฉัน
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="featured" className="space-y-6">
                <FeaturedPosts posts={homeData.featured} loading={false} />
              </TabsContent>

              <TabsContent value="latest" className="space-y-6">
                <FeaturedPosts posts={homeData.latest} loading={false} />
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                <h3 className="text-2xl font-semibold text-foreground mb-6">กระทู้ยอดนิยม</h3>
                <p className="text-muted-foreground">กระทู้ที่ได้รับความสนใจมากที่สุดในวันนี้</p>
              </TabsContent>

              <TabsContent value="myFeed" className="space-y-6">
                <h3 className="text-2xl font-semibold text-foreground mb-6">ฟีดของฉัน</h3>
                <p className="text-muted-foreground">เข้าสู่ระบบเพื่อดูกระทู้ที่คุณติดตาม</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Categories Card */}
            <CategoriesCard />

            {/* Enhanced Trending Topics */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <span>หัวข้อฮิต</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 group border border-transparent hover:border-border/50"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      #{topic.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {topic.count.toLocaleString()}
                      </span>
                      <div className="w-1 h-1 bg-primary/60 rounded-full group-hover:bg-primary transition-colors"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Online Users */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                  <div className="p-1.5 bg-green-500/10 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <span>ผู้ใช้ออนไลน์</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">15,432 คนออนไลน์</span>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-2 hover:bg-accent/50 rounded-lg transition-colors group">
                      <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          U{i}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                        ผู้ใช้{i}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full ml-auto group-hover:bg-green-500 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <span>เริ่มต้นใช้งาน</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start h-11 font-medium hover:bg-primary/5 hover:border-primary/20 transition-all duration-200" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-3" />
                  สร้างกระทู้ใหม่
                </Button>
                <Button className="w-full justify-start h-11 font-medium hover:bg-primary/5 hover:border-primary/20 transition-all duration-200" variant="outline">
                  <Search className="h-4 w-4 mr-3" />
                  ค้นหากระทู้
                </Button>
                <Button className="w-full justify-start h-11 font-medium hover:bg-primary/5 hover:border-primary/20 transition-all duration-200" variant="outline">
                  <Star className="h-4 w-4 mr-3" />
                  กระทู้ที่บันทึก
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                <span className="text-primary">ChanomHub</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                เว็บบอร์ดชั้นนำของไทย ที่รวมคนไทยเข้ามาแลกเปลี่ยนความรู้และความคิดเห็น
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  <span className="text-xs">L</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg text-white">บริการ</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  กระทู้
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  แท็ก
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  กิจกรรม
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  ชุมชน
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg text-white">ช่วยเหลือ</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  คำถามที่พบบ่อย
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  กฎของเว็บไซต์
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  ติดต่อเรา
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  ร้องเรียน
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg text-white">ติดตาม</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Facebook
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Twitter
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  LINE
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-primary transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  YouTube
                </a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-slate-400">
                &copy; 2025 Chanomhub. สงวนลิขสิทธิ์ทุกประการ
              </p>
              <div className="flex space-x-6 text-sm text-slate-400">
                <a href="#" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</a>
                <a href="#" className="hover:text-primary transition-colors">เงื่อนไขการใช้งาน</a>
                <a href="#" className="hover:text-primary transition-colors">คุกกี้</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
