'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Clock, Tag, Monitor, Sparkles, Search, Zap, List, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import Cookies from 'js-cookie';
import { Link, useRouter } from '../../lib/navigation';

export interface SearchFilters {
  categories: string[];
  tags: string[];
  platforms: string[];
}

interface SearchResultsProps {
  results: {
    hits: any[];
    estimatedTotalHits: number;
    offset: number;
    limit: number;
    processingTimeMs: number;
  };
  currentPage: number;
  query: string;
  locale: string;
  filters: SearchFilters;
  loading?: boolean; // New prop for loading state
}

type ViewMode = 'list' | 'grid';

function ResultsHeader({
                         results,
                         query,
                         viewMode,
                         setViewMode,
                         filters,
                       }: {
  results: SearchResultsProps['results'];
  query: string;
  locale: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: SearchFilters;
}) {
  const t = useTranslations('SearchResults');
  const hasActiveFilters = filters.categories.length > 0 || filters.tags.length > 0 || filters.platforms.length > 0;

  return (
    <div className="rounded-xl shadow-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {t('found')} {results.estimatedTotalHits.toLocaleString()} {t('items')}
                </span>
                {query && (
                  <span className="text-gray-700 dark:text-gray-200">
                    {' '}
                    {t('for')} "<span className="text-blue-500 font-semibold">{query}</span>"
                  </span>
                )}
              </h2>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                {t('searchCompleted')} {results.processingTimeMs}ms
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
                    {t('filtersActive')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('list')}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('grid')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({
                      totalPages,
                      currentPage,
                      updatePage,
                      results,
                    }: {
  totalPages: number;
  currentPage: number;
  updatePage: (page: number) => void;
  results: SearchResultsProps['results'];
  locale: string;
}) {
  const t = useTranslations('SearchResults');

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="card bg-gradient-to-r from-primary via-secondary to-accent p-1 shadow-xl">
      <div className="card-body bg-base-100 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="stat-title text-xs">
                {t('showing')}
                <span className="font-bold text-primary mx-1">{results.offset + 1}</span>
                {t('to')}
                <span className="font-bold text-primary mx-1">
                  {Math.min(results.offset + results.hits.length, results.estimatedTotalHits)}
                </span>
                {t('of')}
                <span className="font-bold text-secondary ml-1">{results.estimatedTotalHits.toLocaleString()}</span>
                {t('items')}
              </div>
            </div>
          </div>
          <div className="join">
            <button
              onClick={() => updatePage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="btn btn-outline join-item"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('previous')}
            </button>
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => updatePage(pageNum)}
                className={`btn join-item ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => updatePage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="btn btn-outline join-item"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GridView({ results, formatDate }: { results: SearchResultsProps['results']; formatDate: (date: string) => string; locale: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {results.hits.map((item, index) => (
        <div key={item.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${index * 50}ms` }}>
          <figure className="relative aspect-[16/9]">
            {item.mainImage ? (
              <Image
                src={item.mainImage}
                alt={item.title || 'Game image'}
                fill
                className="object-cover rounded-t-lg transition-transform duration-500 hover:scale-110"
                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-base-200 rounded-t-lg">
                <Monitor className="w-12 h-12 text-primary" />
              </div>
            )}
            {item.sequentialCode && (
              <div className="absolute top-2 left-2 badge badge-neutral text-xs px-2 py-1">#{item.sequentialCode}</div>
            )}
          </figure>
          <div className="card-body p-4 sm:p-5">
            <h3 className="card-title text-base sm:text-lg line-clamp-2">
              <Link href={`/articles/${item.slug || item.id}`} className="hover:text-primary">
                {item.title || 'Untitled'}
              </Link>
            </h3>
            {item.description && <p className="text-base-content/70 text-sm sm:text-base line-clamp-3">{item.description}</p>}
            <div className="flex items-center text-xs sm:text-sm text-base-content/50">
              <Clock className="w-4 h-4 mr-1 text-primary" />
              <span>{item.updatedAt ? formatDate(item.updatedAt) : 'N/A'}</span>
            </div>
            <div className="card-actions flex-wrap gap-2">
              {item.categories?.slice(0, 2).map((category: any) => (
                <div key={category.id} className="badge badge-primary text-xs px-2 py-1">
                  {category.name || 'Unknown'}
                </div>
              ))}
              {item.tags?.slice(0, 1).map((tag: any) => (
                <div key={tag.id} className="badge badge-secondary text-xs px-2 py-1">
                  {tag.name || 'Unknown'}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListView({ results, formatDate }: { results: SearchResultsProps['results']; formatDate: (date: string) => string; locale: string }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {results.hits.map((item, index) => (
        <div key={item.id} className="card card-side bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${index * 100}ms` }}>
          <figure className="w-24 sm:w-32 h-full flex-shrink-0">
            {item.mainImage ? (
              <Image
                src={item.mainImage}
                alt={item.title || 'Game image'}
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-base-200 rounded-lg">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
            )}
          </figure>
          <div className="card-body p-3 sm:p-4">
            <h3 className="card-title text-base sm:text-lg">
              <Link href={`/articles/${item.slug || item.id}`} className="hover:text-primary">
                {item.title || 'Untitled'}
              </Link>
            </h3>
            {item.description && <p className="text-base-content/70 text-sm sm:text-base line-clamp-2">{item.description}</p>}
            <div className="flex items-center space-x-4 text-xs sm:text-sm text-base-content/50">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-primary" />
                <span>{item.updatedAt ? formatDate(item.updatedAt) : 'N/A'}</span>
              </div>
            </div>
            <div className="card-actions flex-wrap gap-2">
              {item.categories?.map((category: any, idx: number) => (
                <div key={category.id} className="badge badge-primary text-xs px-2 py-1" style={{ animationDelay: `${idx * 100}ms` }}>
                  {category.name || 'Unknown'}
                </div>
              ))}
              {item.tags?.map((tag: any, idx: number) => (
                <div key={tag.id} className="badge badge-secondary text-xs px-2 py-1" style={{ animationDelay: `${idx * 100}ms` }}>
                  <Tag className="w-3 h-3 mr-1" />
                  <TranslationTarget>{tag.name || 'Unknown'}</TranslationTarget>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NoResults() {
  const t = useTranslations('SearchResults');

  return (
    <div className="hero bg-base-200 rounded-3xl shadow-xl">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="relative inline-block mb-6">
            <Search className="w-20 h-20 text-base-content/30 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-warning-content" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('noGamesFound')}
          </h3>
          <p className="text-base-content/70 text-lg mb-6">{t('tryAdjusting')}</p>
          <div className="flex justify-center space-x-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonView({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-xl bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-1 shadow-xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className={`flex items-center px-4 py-2 rounded-lg bg-gray-200 ${viewMode === 'list' ? 'opacity-70' : 'opacity-100'}`}>
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline h-4 bg-gray-200 rounded w-12"></span>
              </div>
              <div className={`flex items-center px-4 py-2 rounded-lg bg-gray-200 ${viewMode === 'grid' ? 'opacity-70' : 'opacity-100'}`}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline h-4 bg-gray-200 rounded w-12"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-lg rounded-lg border">
              <div className="relative aspect-[16/9]">
                <div className="w-full h-full bg-gray-200 rounded-t-lg"></div>
                <div className="absolute top-2 left-2 h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="card-body p-4 sm:p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="card card-side bg-base-100 shadow-lg rounded-lg border">
              <div className="w-24 sm:w-32 h-full flex-shrink-0">
                <div className="w-full h-full bg-gray-200 rounded-lg"></div>
              </div>
              <div className="card-body p-3 sm:p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Skeleton */}
      <div className="card bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-1 shadow-xl">
        <div className="card-body bg-base-100 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure">
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="stat-title">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
            <div className="join flex gap-2">
              <div className="btn btn-outline join-item h-8 w-20 bg-gray-200 rounded"></div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="btn join-item h-8 w-8 bg-gray-200 rounded"></div>
              ))}
              <div className="btn btn-outline join-item h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TranslationTarget({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <span className="translate-tooltip-target">{children}</span>
    </Suspense>
  );
}

export default function SearchResults({ results, currentPage, query, locale, filters, loading }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('SearchResults');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = Cookies.get('viewMode');
    return savedMode === 'list' || savedMode === 'grid' ? savedMode : 'list';
  });
  const totalPages = Math.ceil(results.estimatedTotalHits / results.limit);

  useEffect(() => {
    Cookies.set('viewMode', viewMode, { expires: 30 });
  }, [viewMode]);

  const updatePage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.push(`/games?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, totalPages]
  );

  const formatDate = useCallback(
    (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return 'N/A';
      }
    },
    [locale]
  );

  if (loading) {
    return <SkeletonView viewMode={viewMode} />;
  }

  if (!results.hits?.length) {
    return <NoResults />;
  }

  return (
    <div className="space-y-8">
      <ResultsHeader results={results} query={query} locale={locale} viewMode={viewMode} setViewMode={setViewMode} filters={filters} />
      {viewMode === 'grid' ? (
        <GridView results={results} formatDate={formatDate} locale={locale} />
      ) : (
        <ListView results={results} formatDate={formatDate} locale={locale} />
      )}
      {totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={currentPage} updatePage={updatePage} results={results} locale={locale} />
      )}
      <style jsx>{`
          .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
          }
          .line-clamp-3 {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
          }
      `}</style>
    </div>
  );
}