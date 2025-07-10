import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchCategories, fetchTags, fetchPlatforms } from '../lib/searchUtils';
import ClientGamesWrapper from './components/ClientGamesWrapper';

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

export default async function GamesPage({
                                          params,
                                          searchParams,
                                        }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'GamesPage' });

  console.log('🎮 Server GamesPage - searchParams:', resolvedSearchParams);
  console.log('🌍 Server GamesPage - params:', resolvedParams);
  console.log('🔍 Server GamesPage - searchParams keys:', Object.keys(resolvedSearchParams));

  try {
    console.log('⏳ Server - Starting initial data fetch...');

    const [categories, tags, platforms] = await Promise.all([
      fetchCategories().catch(error => {
        console.error('❌ Categories fetch error:', error);
        return [];
      }),
      fetchTags().catch(error => {
        console.error('❌ Tags fetch error:', error);
        return [];
      }),
      fetchPlatforms().catch(error => {
        console.error('❌ Platforms fetch error:', error);
        return [];
      }),
    ]);

    console.log('✅ Server - Initial data fetch completed!');
    console.log('📁 Categories count:', categories.length);
    console.log('🏷️ Tags count:', tags.length);
    console.log('💻 Platforms count:', platforms.length);

    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <ClientGamesWrapper
          locale={resolvedParams.locale}
          initialCategories={categories}
          initialTags={tags}
          initialPlatforms={platforms}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('💥 Critical error loading games page:', error);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-xl font-bold text-red-800 mb-2">
              {t('error.title')}
            </h1>
            <p className="text-red-700 mb-4">
              {t('error.description')}
            </p>

            <details className="text-left text-sm text-red-600 bg-red-100 p-3 rounded mt-4">
              <summary className="cursor-pointer">{t('error.details')}</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </details>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('error.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}