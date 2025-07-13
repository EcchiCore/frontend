// app/[locale]/games/SearchFilters.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FilterOption {
  id: string;
  name: string;
}

interface SearchFiltersProps {
  categories: FilterOption[];
  tags: FilterOption[];
  platforms: FilterOption[];
  loading?: boolean;
}

export default function SearchFilters({ categories, tags, platforms, loading }: SearchFiltersProps) {
  const t = useTranslations('SearchFilters');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sequentialCode, setSequentialCode] = useState(searchParams.get('code') || '');

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value?.trim()) params.set(key, value.trim());
        else params.delete(key);
      });
      params.delete('page');
      router.push(`/games${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleFilterChange = (key: string, value: string | null) => updateFilters({ [key]: value });

  const activeFilters = [
    searchParams.get('q') ? { key: 'q', label: `${t('search')}: ${searchParams.get('q')}` } : null,
    searchParams.get('code') ? { key: 'code', label: `${t('sequentialCode')}: ${searchParams.get('code')}` } : null,
    searchParams.get('category') ? { key: 'category', label: categories.find(c => c.id === searchParams.get('category'))?.name || '' } : null,
    searchParams.get('tag') ? { key: 'tag', label: tags.find(t => t.id === searchParams.get('tag'))?.name || '' } : null,
    searchParams.get('platform') ? { key: 'platform', label: platforms.find(p => p.id === searchParams.get('platform'))?.name || '' } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  const clearAllFilters = () => {
    setSearchQuery('');
    setSequentialCode('');
    router.push('/games', { scroll: false });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="skeleton h-6 w-32 mb-4"></div>
              <div className="skeleton h-10 w-full mb-2"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search inputs */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg">{t('gameSearch')}</h2>
          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2">
              <Search className="w-4 h-4 text-base-content/60" />
              <input
                type="text"
                placeholder={t('searchGame')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange('q', e.target.value);
                }}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <Hash className="w-4 h-4 text-base-content/60" />
              <input
                type="text"
                placeholder={t('sequentialCode')}
                value={sequentialCode}
                onChange={(e) => {
                  setSequentialCode(e.target.value);
                  handleFilterChange('code', e.target.value);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-base">{t('activeFilters')}</h3>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(f => (
                <div key={f.key} className="badge badge-secondary badge-outline gap-1">
                  {f.label}
                  <button onClick={() => handleFilterChange(f.key, null)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={clearAllFilters}>
                <X className="w-4 h-4" /> {t('clearAll')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter sections */}
      <FilterSection title={t('allCategories')} options={categories} paramKey="category" />
      <FilterSection title={t('allTags')} options={tags} paramKey="tag" />
      <FilterSection title={t('allPlatforms')} options={platforms} paramKey="platform" />
    </div>
  );
}

function FilterSection({ title, options, paramKey }: { title: string; options: FilterOption[]; paramKey: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('SearchFilters');

  const selected = searchParams.get(paramKey) || '';

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === selected) params.delete(paramKey);
    else params.set(paramKey, id);
    params.delete('page');
    router.push(`/games?${params.toString()}`, { scroll: false });
  };

  if (!options.length) return null;

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">{t('all')}</span>
            <input
              type="radio"
              name={paramKey}
              className="radio radio-primary"
              checked={selected === ''}
              onChange={() => handleSelect('')}
            />
          </label>
        </div>
        {options.map(opt => (
          <div key={opt.id} className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">{opt.name}</span>
              <input
                type="radio"
                name={paramKey}
                className="radio radio-primary"
                checked={selected === opt.id}
                onChange={() => handleSelect(opt.id)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}