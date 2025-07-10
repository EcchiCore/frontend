'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import SearchFilters from './SearchFilters';
import SearchResults, { SearchFilters as ResultsFilters } from './SearchResults';
import SearchSkeleton from './SearchSkeleton';

interface SearchParams {
  query: string;
  page?: number;
  filters?: ClientSearchFilters;
  pageSize?: number;
  hybridSearch?: boolean;
}

interface ClientSearchFilters {
  categoryIds?: string[];
  tagIds?: string[];
  platformsIds?: string[];
  sequentialCode?: string | null;
}

interface SearchResult {
  hits: any[];
  estimatedTotalHits: number;
  offset: number;
  limit: number;
  processingTimeMs: number;
}

const searchArticlesClient = async ({ query, page = 1, filters, pageSize = 12 }: SearchParams): Promise<SearchResult> => {
  console.log('🔍 searchArticlesClient called with:', { query, page, filters, pageSize });

  const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_HOST_EXTERNAL;
  const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY_EXTERNAL;

  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    console.error('❌ MeiliSearch client configuration missing:', {
      url: MEILISEARCH_URL ? 'present' : 'missing',
      key: MEILISEARCH_API_KEY ? 'present' : 'missing'
    });
    throw new Error('MeiliSearch client configuration is missing');
  }

  const offset = (page - 1) * pageSize;
  console.log(`📊 Client pagination: page=${page}, pageSize=${pageSize}, offset=${offset}`);

  const filterConditions = [];
  if (filters?.categoryIds?.[0]) filterConditions.push(`categories.id = "${filters.categoryIds[0]}"`);
  if (filters?.tagIds?.[0]) filterConditions.push(`tags.id = "${filters.tagIds[0]}"`);
  if (filters?.platformsIds?.[0]) filterConditions.push(`platforms.id = "${filters.platformsIds[0]}"`);
  if (filters?.sequentialCode && filters.sequentialCode.trim()) {
    filterConditions.push(`sequentialCode = "${filters.sequentialCode.trim()}"`);
  }

  const requestBody = {
    q: query || '',
    offset: offset,
    limit: pageSize,
    filter: filterConditions.length ? filterConditions : undefined,
    sort: ['updatedAt:desc'],
  };

  console.log('📤 Client MeiliSearch request:', {
    url: `${MEILISEARCH_URL}/indexes/article/search`,
    method: 'POST',
    body: JSON.stringify(requestBody, null, 2),
    filters: filterConditions
  });

  try {
    const response = await fetch(`${MEILISEARCH_URL}/indexes/article/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Client MeiliSearch response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Client MeiliSearch error response:', errorText);
      throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log('📋 Client MeiliSearch response data:', {
      estimatedTotalHits: data.estimatedTotalHits,
      actualHitsReturned: data.hits?.length,
      requestedOffset: offset,
      responseOffset: data.offset,
      requestedLimit: pageSize,
      responseLimit: data.limit,
      processingTimeMs: data.processingTimeMs,
      firstItemId: data.hits?.[0]?.id,
      lastItemId: data.hits?.[data.hits?.length - 1]?.id
    });

    return {
      hits: data.hits || [],
      estimatedTotalHits: data.estimatedTotalHits || 0,
      offset: data.offset + 1,
      limit: pageSize,
      processingTimeMs: data.processingTimeMs || 0,
    };
  } catch (error) {
    console.error('💥 Client search error:', error);
    throw error;
  }
};

interface ClientGamesWrapperProps {
  locale: string;
  initialCategories: any[];
  initialTags: any[];
  initialPlatforms: any[];
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultSearchResult: SearchResult = {
  hits: [],
  estimatedTotalHits: 0,
  offset: 1,
  limit: 12,
  processingTimeMs: 0,
};

export default function ClientGamesWrapper({
                                             locale,
                                             initialCategories,
                                             initialTags,
                                             initialPlatforms
                                           }: ClientGamesWrapperProps) {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const t = useTranslations('GamesPage');

  const query = searchParams.get('q')?.trim() || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const clientFilters = useMemo(() => {
    return {
      categoryIds: searchParams.get('category')?.split(',').filter(Boolean) || [],
      tagIds: searchParams.get('tag')?.split(',').filter(Boolean) || [],
      platformsIds: searchParams.get('platform')?.split(',').filter(Boolean) || [],
      sequentialCode: searchParams.get('code')?.trim() || null,
    };
  }, [searchParams]);

  const searchResultsFilters: ResultsFilters = useMemo(() => {
    return {
      categories: clientFilters.categoryIds,
      tags: clientFilters.tagIds,
      platforms: clientFilters.platformsIds,
    };
  }, [clientFilters]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching search results with params:', {
          query,
          page: currentPage,
          pageSize: 12,
          filters: clientFilters
        });

        const results = await searchArticlesClient({
          query,
          page: currentPage,
          pageSize: 12,
          filters: clientFilters,
          hybridSearch: true
        });

        console.log('✅ Search results fetched:', {
          totalHits: results.estimatedTotalHits,
          returnedHits: results.hits.length,
          offset: results.offset,
          currentPage
        });

        setSearchResults(results);
      } catch (err) {
        console.error('❌ Error fetching search results:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setSearchResults({
          hits: [],
          estimatedTotalHits: 0,
          offset: 1,
          limit: 12,
          processingTimeMs: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentPage, clientFilters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('description')}
            </p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="animate-pulse bg-white rounded-lg h-96" />
            </aside>
            <main className="lg:col-span-3">
              <SearchSkeleton />
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('description')}
          </p>
        </header>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-black">
            <details open>
              <summary className="cursor-pointer font-medium">{t('debug.title', { 0: currentPage })}</summary>
              <div className="mt-2 space-y-1">
                <p><strong>{t('debug.urlParams')}:</strong> {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
                <p><strong>{t('debug.pageParam')}:</strong> {searchParams.get('page') || 'undefined'}</p>
                <p><strong>{t('debug.parsedPage')}:</strong> {currentPage}</p>
                <p><strong>{t('debug.expectedOffset')}:</strong> {(currentPage - 1) * 12}</p>
                <p><strong>{t('debug.actualOffset')}:</strong> {searchResults?.offset}</p>
                <p><strong>{t('debug.searchQuery')}:</strong> &#34;{query}&#34;</p>
                <p><strong>{t('debug.sequentialCode')}:</strong> &#34;{clientFilters.sequentialCode || 'none'}&#34;</p>
                <p><strong>{t('debug.pageSize')}:</strong> 12</p>
                <p><strong>{t('debug.totalResults')}:</strong> {searchResults?.estimatedTotalHits}</p>
                <p><strong>{t('debug.resultsCount')}:</strong> {searchResults?.hits?.length ?? 0}</p>
                <p><strong>{t('debug.processingTime')}:</strong> {searchResults?.processingTimeMs}ms</p>
                <p><strong>{t('debug.filters')}:</strong> {JSON.stringify(clientFilters)}</p>
                {searchResults && Array.isArray(searchResults.hits) && searchResults.hits.length > 0 && (
                  <p><strong>{t('debug.firstResultId')}:</strong> {searchResults.hits[0].id}</p>
                )}
              </div>
            </details>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <SearchFilters
              categories={initialCategories}
              tags={initialTags}
              platforms={initialPlatforms}
              locale={locale}
            />
          </aside>

          <main className="lg:col-span-3">
            <SearchResults
              results={searchResults || defaultSearchResult}
              currentPage={currentPage}
              query={query}
              filters={searchResultsFilters}
              locale={locale}
            />
          </main>
        </div>
      </div>
    </div>
  );
}