'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Clock, Search, Zap, List, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  loading?: boolean;
}

type ViewMode = 'list' | 'grid';

export default function SearchResults({
                                        results,
                                        currentPage,
                                        query,
                                        locale,
                                        loading,
                                      }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('SearchResults');

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    setMounted(true);
    const saved = Cookies.get('viewMode');
    setViewMode(saved === 'grid' ? 'grid' : 'list');
  }, []);

  useEffect(() => {
    if (mounted) Cookies.set('viewMode', viewMode, { expires: 30 });
  }, [viewMode, mounted]);

  const totalPages = Math.ceil(results.estimatedTotalHits / results.limit);

  const updatePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/games?${params.toString()}`, { scroll: false });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading || !mounted) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="skeleton w-24 h-24 rounded-md"></div>
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-5 w-3/4"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results.hits.length) {
    return (
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body text-center py-12">
          <Search className="w-12 h-12 mx-auto text-base-content/60 mb-4" />
          <h3 className="text-lg font-semibold">{t('noGamesFound')}</h3>
          <p className="text-sm text-base-content/60">{t('tryAdjusting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="card-title">
                {t('found')} {results.estimatedTotalHits.toLocaleString()} {t('items')}
                {query && (
                  <>
                    {' '}
                    {t('for')} <span className="font-bold">&quot;{query}&quot;</span>
                  </>
                )}
              </h2>
              <p className="text-sm text-base-content/60">
                <Zap className="inline w-4 h-4 mr-1" />
                {t('searchCompleted')} {results.processingTimeMs}ms
              </p>
            </div>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('list')}
                aria-label={t('list')}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
                aria-label={t('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }
      >
        {results.hits.map((item) => (
          <div key={item.id} className="card bg-base-200 shadow-lg">
            <div className="card-body p-4">
              <div className={viewMode === 'list' ? 'flex items-start gap-4' : ''}>
                {item.mainImage ? (
                  <Image
                    src={item.mainImage}
                    alt={item.title || 'Game image'}
                    width={viewMode === 'grid' ? 300 : 100}
                    height={viewMode === 'grid' ? 200 : 100}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-base-300 w-full h-32 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-base-content/60">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  </div>
                )}
                <div className="mt-2">
                  <h3 className="font-semibold text-base">
                    <Link href={`/articles/${item.slug || item.id}`} className="hover:underline">
                      {item.title || 'Untitled'}
                    </Link>
                  </h3>
                  <p className="text-sm text-base-content/60 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-base-content/60">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.categories?.slice(0, 2).map((c: any) => (
                      <span key={c.id} className="badge badge-outline">
                        {c.name}
                      </span>
                    ))}
                    {item.tags?.slice(0, 1).map((t: any) => (
                      <span key={t.id} className="badge badge-secondary">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-base-content/60">
            {t('showing')} {results.offset} -{' '}
            {Math.min(results.offset + results.limit - 1, results.estimatedTotalHits)} {t('of')}{' '}
            {results.estimatedTotalHits}
          </span>
          <div className="btn-group">
            <button
              className="btn btn-sm"
              onClick={() => updatePage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" /> {t('previous')}
            </button>
            <button
              className="btn btn-sm"
              onClick={() => updatePage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              {t('next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}