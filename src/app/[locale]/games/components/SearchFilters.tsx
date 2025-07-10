'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, Hash, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FilterOption {
  id: string;
  name: string;
}

interface SearchFiltersProps {
  categories: FilterOption[];
  tags: FilterOption[];
  platforms: FilterOption[];
  locale: string;
}

export default function SearchFilters({ categories, tags, platforms, locale }: SearchFiltersProps) {
  const t = useTranslations('SearchFilters');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sequentialCode, setSequentialCode] = useState(searchParams.get('code') || '');

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value?.trim()) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    });
    params.delete('page'); // Reset to first page on filter change
    router.push(`/games${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  const handleFilterChange = useCallback(
    (key: string, value: string | null) => updateFilters({ [key]: value }),
    [updateFilters]
  );

  const getActiveFilters = useCallback(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    const currentQuery = searchParams.get('q');
    const currentCode = searchParams.get('code');
    const currentCategory = searchParams.get('category');
    const currentTag = searchParams.get('tag');
    const currentPlatform = searchParams.get('platform');

    if (currentQuery) {
      filters.push({
        key: 'q',
        label: `${t('search')}: ${currentQuery}`,
        value: currentQuery
      });
    }

    if (currentCode) {
      filters.push({
        key: 'code',
        label: `${t('sequentialCode')}: ${currentCode}`,
        value: currentCode
      });
    }

    if (currentCategory) {
      const category = categories.find(c => c.id === currentCategory);
      if (category) {
        filters.push({ key: 'category', label: category.name, value: currentCategory });
      }
    }

    if (currentTag) {
      const tag = tags.find(t => t.id === currentTag);
      if (tag) {
        filters.push({ key: 'tag', label: tag.name, value: currentTag });
      }
    }

    if (currentPlatform) {
      const platform = platforms.find(p => p.id === currentPlatform);
      if (platform) {
        filters.push({ key: 'platform', label: platform.name, value: currentPlatform });
      }
    }

    return filters;
  }, [searchParams, categories, tags, platforms, t]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSequentialCode('');
    router.push('/games', { scroll: false });
  }, [router]);

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-6 sticky top-4">
      {/* Enhanced Search Section */}
      <div className="relative group">
        {/* Animated Background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700 animate-pulse"></div>

        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-40 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('gameSearch')}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm text-gray-500">Real-time search</span>
              </div>
            </div>
            <Sparkles className="w-5 h-5 ml-auto text-yellow-500 animate-spin" style={{animationDuration: '4s'}} />
          </div>

          {/* Search Inputs */}
          <div className="space-y-6">
            {/* Game Search Input */}
            <div className="relative group/input">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur opacity-0 group-hover/input:opacity-40 transition-all duration-500"></div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"></div>
                <div className="relative flex items-center">
                  <div className="absolute left-5 z-10">
                    <div className="relative">
                      <Search className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover/input:text-blue-700 group-hover/input:scale-110" />
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-0 group-hover/input:opacity-30 transition-all duration-300"></div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={t('searchGame')}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleFilterChange('q', e.target.value);
                    }}
                    className="w-full pl-16 pr-6 py-5 bg-transparent border-2 border-blue-200/50 rounded-2xl
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-200/30 focus:outline-none
                             hover:border-blue-300 hover:shadow-xl
                             transition-all duration-300 text-gray-800 placeholder-gray-500
                             text-lg font-medium"
                  />
                </div>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/input:opacity-100 transition-opacity duration-700 -skew-x-12 transform -translate-x-full group-hover/input:translate-x-full pointer-events-none"></div>
              </div>
            </div>

            {/* Sequential Code Input */}
            <div className="relative group/input">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-600 rounded-2xl blur opacity-0 group-hover/input:opacity-40 transition-all duration-500"></div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl"></div>
                <div className="relative flex items-center">
                  <div className="absolute left-5 z-10">
                    <div className="relative">
                      <Hash className="w-6 h-6 text-purple-600 transition-all duration-300 group-hover/input:text-purple-700 group-hover/input:scale-110" />
                      <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-0 group-hover/input:opacity-30 transition-all duration-300"></div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={t('sequentialCode')}
                    value={sequentialCode}
                    onChange={(e) => {
                      setSequentialCode(e.target.value);
                      handleFilterChange('code', e.target.value);
                    }}
                    className="w-full pl-16 pr-6 py-5 bg-transparent border-2 border-purple-200/50 rounded-2xl
                             focus:border-purple-500 focus:ring-4 focus:ring-purple-200/30 focus:outline-none
                             hover:border-purple-300 hover:shadow-xl
                             transition-all duration-300 text-gray-800 placeholder-gray-500
                             text-lg font-medium"
                  />
                </div>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/input:opacity-100 transition-opacity duration-700 -skew-x-12 transform -translate-x-full group-hover/input:translate-x-full pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Active Filters */}
      {activeFilters.length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>

          <div className="relative bg-gradient-to-br from-red-50/80 via-pink-50/80 to-rose-50/80 backdrop-blur-xl rounded-3xl shadow-xl border border-red-100/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="flex space-x-1 mr-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <h3 className="font-bold text-xl text-gray-900">
                  {t('activeFilters')}
                </h3>
              </div>
              <button
                onClick={clearAllFilters}
                className="group/clear flex items-center px-6 py-3 text-sm font-medium text-red-600 hover:text-white
                         bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500
                         rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105
                         border border-red-200 hover:border-transparent">
                <X className="w-4 h-4 mr-2 group-hover/clear:rotate-90 transition-transform duration-300" />
                {t('clearAll')}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeFilters.map((filter, index) => (
                <div
                  key={`${filter.key}-${filter.value}`}
                  className="group/filter relative animate-in slide-in-from-left duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur opacity-0 group-hover/filter:opacity-40 transition-all duration-300"></div>
                  <span className="relative flex items-center px-5 py-3 rounded-full text-sm font-medium
                                 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800
                                 hover:from-blue-200 hover:to-purple-200 transition-all duration-300
                                 hover:shadow-lg hover:scale-105 border border-blue-200/50">
                    {filter.label}
                    <button
                      onClick={() => {
                        if (filter.key === 'q') setSearchQuery('');
                        if (filter.key === 'code') setSequentialCode('');
                        handleFilterChange(filter.key, null);
                      }}
                      className="ml-3 p-1.5 hover:bg-red-200 rounded-full transition-all duration-200
                               group-hover/filter:rotate-90 hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filter Sections */}
      <FilterSection
        title={t('allCategories')}
        options={categories}
        selectedValue={searchParams.get('category') || ''}
        onSelectionChange={(value) => handleFilterChange('category', value)}
        locale={locale}
        t={t}
        gradient="from-emerald-500 to-teal-600"
        hoverGradient="from-emerald-400 to-teal-500"
      />

      <FilterSection
        title={t('allTags')}
        options={tags}
        selectedValue={searchParams.get('tag') || ''}
        onSelectionChange={(value) => handleFilterChange('tag', value)}
        locale={locale}
        gradient="from-orange-500 to-red-600"
        hoverGradient="from-orange-400 to-red-500"
        t={t}
      />

      <FilterSection
        title={t('allPlatforms')}
        options={platforms}
        selectedValue={searchParams.get('platform') || ''}
        onSelectionChange={(value) => handleFilterChange('platform', value)}
        locale={locale}
        gradient="from-violet-500 to-purple-600"
        hoverGradient="from-violet-400 to-purple-500"
        t={t}
      />
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelectionChange: (value: string | null) => void;
  gradient?: string;
  hoverGradient?: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function FilterSection({
                         title,
                         options,
                         selectedValue,
                         onSelectionChange,
                         gradient = "from-emerald-500 to-teal-600",
                         t
                       }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!options.length) return null;

  return (
    <div className="relative group">
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-all duration-500`}></div>

      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex justify-between items-center w-full group/header"
          >
            <div className="flex items-center">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl blur-md opacity-40`}></div>
                <div className={`relative p-3 bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}>
                  <Filter className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-xl text-gray-900">{title}</h3>
                <div className="flex items-center mt-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">{options.length} options</span>
                </div>
              </div>
            </div>
            <div className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
              {isExpanded ?
                <ChevronUp className="w-5 h-5 text-gray-500 group-hover/header:text-gray-700 transition-all duration-200" /> :
                <ChevronDown className="w-5 h-5 text-gray-500 group-hover/header:text-gray-700 transition-all duration-200" />
              }
            </div>
          </button>
        </div>

        {/* Options */}
        <div className={`transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
            {/* All Options */}
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-4 rounded-2xl transition-all duration-300 group/option">
              <div className="relative">
                <input
                  type="radio"
                  name={title.toLowerCase()}
                  checked={!selectedValue}
                  onChange={() => onSelectionChange(null)}
                  className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full
                           checked:border-blue-500 checked:bg-blue-500 transition-all duration-200
                           focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
                {!selectedValue && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <span className="ml-4 text-sm text-gray-500 italic font-medium group-hover/option:text-gray-700 transition-colors duration-200">
                {t('allCategories')}
              </span>
            </label>

            {/* Individual Options */}
            {options.map((option, index) => (
              <label
                key={option.id}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-4 rounded-2xl transition-all duration-300 group/option animate-in slide-in-from-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name={title.toLowerCase()}
                    value={option.id}
                    checked={selectedValue === option.id}
                    onChange={(e) => onSelectionChange(e.target.checked ? option.id : null)}
                    className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full
                             checked:border-blue-500 checked:bg-blue-500 transition-all duration-200
                             focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                  {selectedValue === option.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="ml-4 text-sm text-gray-700 font-medium group-hover/option:text-gray-900 transition-colors duration-200">
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}