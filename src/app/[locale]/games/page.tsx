import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchCategories, fetchTags, fetchPlatforms } from '../lib/searchUtils';
import ClientGamesWrapper from './components/ClientGamesWrapper';
import Navber from './../components/Navbar'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'GamesPage' });

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    openGraph: {
      title: t('metadata.title'),
      description: t('metadata.description'),
      type: 'website',
    },
  };
}

// 2. แก้ไข page.tsx เพื่อให้ debug ได้ดีขึ้น
export default async function GamesPage({
                                          params,
                                          searchParams,
                                        }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;



  console.log('🎮 Server GamesPage - Starting...');
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('🔧 MeiliSearch Config Check:', {
    internal_url: !!process.env.MEILISEARCH_HOST_INTERNAL,
    external_url: !!process.env.NEXT_PUBLIC_MEILISEARCH_HOST_EXTERNAL,
    internal_key: !!process.env.MEILISEARCH_API_KEY_INTERNAL,
    external_key: !!process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY_EXTERNAL,
  });

  try {
    console.log('⏳ Server - Starting initial data fetch...');
    const startTime = Date.now();

    const [categories, tags, platforms] = await Promise.allSettled([
      fetchCategories(),
      fetchTags(),
      fetchPlatforms(),
    ]);

    const endTime = Date.now();
    console.log(`⏱️ Server - Data fetch completed in ${endTime - startTime}ms`);

    // ตรวจสอบผลลัพธ์ของแต่ละการ fetch
    const categoriesResult = categories.status === 'fulfilled' ? categories.value : [];
    const tagsResult = tags.status === 'fulfilled' ? tags.value : [];
    const platformsResult = platforms.status === 'fulfilled' ? platforms.value : [];

    console.log('📊 Server - Fetch Results:');
    console.log('📁 Categories:', categories.status, categoriesResult.length);
    console.log('🏷️ Tags:', tags.status, tagsResult.length);
    console.log('💻 Platforms:', platforms.status, platformsResult.length);

    // Log errors if any
    if (categories.status === 'rejected') {
      console.error('❌ Categories fetch failed:', categories.reason);
    }
    if (tags.status === 'rejected') {
      console.error('❌ Tags fetch failed:', tags.reason);
    }
    if (platforms.status === 'rejected') {
      console.error('❌ Platforms fetch failed:', platforms.reason);
    }

    // ถ้าข้อมูลทั้งหมดเป็นว่างเปล่า ให้แสดง warning
    if (categoriesResult.length === 0 && tagsResult.length === 0 && platformsResult.length === 0) {
      console.warn('⚠️ All filter options are empty! This will affect user experience.');
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <Navber />
        <ClientGamesWrapper
          locale={resolvedParams.locale}
          initialCategories={categoriesResult}
          initialTags={tagsResult}
          initialPlatforms={platformsResult}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('💥 Critical error loading games page:', error);

    // ในกรณีที่ fetch ล้มเหลว ให้ส่งข้อมูลเปล่าแทน
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <Navber />
        <ClientGamesWrapper
          locale={resolvedParams.locale}
          initialCategories={[]}
          initialTags={[]}
          initialPlatforms={[]}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    );
  }
}