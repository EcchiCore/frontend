'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { List, LayoutGrid, Search, Filter, Hash, Sparkles } from 'lucide-react';

type ViewMode = 'list' | 'grid';

export default function SearchSkeleton() {
  const [viewMode] = useState<ViewMode>(() => {
    const savedMode = Cookies.get('viewMode');
    return savedMode === 'list' || savedMode === 'grid' ? savedMode : 'list';
  });

  useEffect(() => {
    Cookies.set('viewMode', viewMode, { expires: 30 });
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <header className="mb-8 text-center animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-80 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <div className="space-y-6 sticky top-4">
              {/* Search Section Skeleton */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-40 animate-pulse"></div>
                      <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="h-8 bg-gray-200 rounded-lg w-32 mb-2"></div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mr-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 ml-auto text-gray-300 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div className="space-y-6">
                    {/* Search Input Skeleton */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"></div>
                      <div className="relative flex items-center">
                        <div className="absolute left-5 z-10">
                          <Search className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="w-full pl-16 pr-6 py-5 bg-gray-100 rounded-2xl border-2 border-gray-200"></div>
                      </div>
                    </div>
                    {/* Sequential Code Input Skeleton */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl"></div>
                      <div className="relative flex items-center">
                        <div className="absolute left-5 z-10">
                          <Hash className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="w-full pl-16 pr-6 py-5 bg-gray-100 rounded-2xl border-2 border-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Sections Skeleton */}
              {['Categories', 'Tags', 'Platforms'].map((section, index) => (
                <div key={section} className="relative group">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${
                    index === 0 ? 'from-emerald-500 to-teal-600' :
                      index === 1 ? 'from-orange-500 to-red-600' :
                        'from-violet-500 to-purple-600'
                  } rounded-3xl blur-xl opacity-10 animate-pulse`}></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-100/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-r ${
                              index === 0 ? 'from-emerald-500 to-teal-600' :
                                index === 1 ? 'from-orange-500 to-red-600' :
                                  'from-violet-500 to-purple-600'
                            } rounded-xl blur-md opacity-40`}></div>
                            <div className={`relative p-3 bg-gradient-to-r ${
                              index === 0 ? 'from-emerald-500 to-teal-600' :
                                index === 1 ? 'from-orange-500 to-red-600' :
                                  'from-violet-500 to-purple-600'
                            } rounded-xl shadow-lg`}>
                              <Filter className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mr-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 rounded-full bg-gray-100">
                          <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      {/* "All" option */}
                      <div className="flex items-center p-4 rounded-2xl">
                        <div className="w-5 h-5 bg-gray-200 rounded-full mr-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      {/* Filter options */}
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="flex items-center p-4 rounded-2xl">
                          <div className="w-5 h-5 bg-gray-200 rounded-full mr-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="lg:col-span-3">
            <div className="space-y-8">
              {/* Results Header Skeleton */}
              <div className="rounded-xl bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-1 shadow-xl">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'list'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <List className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">List</span>
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Grid</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Skeleton */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white shadow-lg rounded-lg border overflow-hidden animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative aspect-[16/9]">
                        <div className="w-full h-full bg-gray-200"></div>
                        <div className="absolute top-2 left-2 h-6 w-16 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
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
                    <div
                      key={index}
                      className="bg-white shadow-lg rounded-lg border overflow-hidden flex animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0">
                        <div className="w-full h-full bg-gray-200"></div>
                      </div>
                      <div className="flex-1 p-3 sm:p-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
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
              <div className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-1 rounded-xl shadow-xl">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                      <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}