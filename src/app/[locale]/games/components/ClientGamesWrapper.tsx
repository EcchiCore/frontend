'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { fetchCategories, fetchTags, fetchPlatforms } from '../../lib/searchUtils';
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
  const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_HOST_EXTERNAL;
  const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY_EXTERNAL;

  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    throw new Error('MeiliSearch client configuration is missing');
  }

  const offset = (page - 1) * pageSize;
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

  const response = await fetch(`${MEILISEARCH_URL}/indexes/article/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return {
    hits: data.hits || [],
    estimatedTotalHits: data.estimatedTotalHits || 0,
    offset: data.offset + 1,
    limit: pageSize,
    processingTimeMs: data.processingTimeMs || 0,
  };
};

interface ClientGamesWrapperProps {
  locale: string;
}

const defaultSearchResult: SearchResult = {
  hits: [],
  estimatedTotalHits: 0,
  offset: 1,
  limit: 12,
  processingTimeMs: 0,
};

export default function ClientGamesWrapper({ locale }: ClientGamesWrapperProps) {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const t = useTranslations('GamesPage');

  // Fetch filter options (categories, tags, platforms) on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cats, tgs, plats] = await Promise.all([
          fetchCategories(),
          fetchTags(),
          fetchPlatforms(),
        ]);
        setCategories(cats);
        setTags(tgs);
        setPlatforms(plats);
      } catch (err) {
        console.error('Error fetching options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // Fetch search results based on URL parameters
  const query = searchParams.get('q')?.trim() || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const clientFilters = useMemo(() => ({
    categoryIds: searchParams.get('category')?.split(',').filter(Boolean) || [],
    tagIds: searchParams.get('tag')?.split(',').filter(Boolean) || [],
    platformsIds: searchParams.get('platform')?.split(',').filter(Boolean) || [],
    sequentialCode: searchParams.get('code')?.trim() || null,
  }), [searchParams]);

  const searchResultsFilters: ResultsFilters = useMemo(() => ({
    categories: clientFilters.categoryIds,
    tags: clientFilters.tagIds,
    platforms: clientFilters.platformsIds,
  }), [clientFilters]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchArticlesClient({
          query,
          page: currentPage,
          pageSize: 12,
          filters: clientFilters,
          hybridSearch: true,
        });
        setSearchResults(results);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setSearchResults(defaultSearchResult);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, currentPage, clientFilters]);

  if (loading || loadingOptions) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-xl font-bold text-red-800 mb-2">{t('error.title')}</h1>
            <p className="text-red-700 mb-4">{t('error.description')}</p>
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
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-lg text-gray-600">{t('description')}</p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <SearchFilters
                categories={categories}
                tags={tags}
                platforms={platforms}
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
    </>
  );
}