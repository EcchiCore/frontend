// app/[locale]/games/SearchSkeleton.tsx
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type ViewMode = 'list' | 'grid';

export default function SearchSkeleton() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    setMounted(true);
    const saved = Cookies.get('viewMode');
    setViewMode(saved === 'grid' ? 'grid' : 'list');
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <header className="mb-8 text-center animate-pulse">
          <div className="skeleton h-10 w-80 mx-auto mb-4"></div>
          <div className="skeleton h-6 w-96 mx-auto"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <div className="space-y-6 sticky top-4">
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div className="skeleton h-6 w-32 mb-4"></div>
                  <div className="skeleton h-10 w-full mb-2"></div>
                  <div className="skeleton h-10 w-full"></div>
                </div>
              </div>
              {['Categories', 'Tags', 'Platforms'].map(s => (
                <div key={s} className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <div className="skeleton h-6 w-24 mb-3"></div>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="skeleton h-8 w-full mb-2"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Skeleton */}
          <main className="lg:col-span-3">
            <div className="space-y-8">
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="skeleton w-12 h-12 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="skeleton h-6 w-48"></div>
                        <div className="skeleton h-4 w-32"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="skeleton h-10 w-20"></div>
                      <div className="skeleton h-10 w-20"></div>
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton h-64 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-32 rounded-lg"></div>
                  ))}
                </div>
              )}

              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="skeleton h-6 w-48"></div>
                    <div className="flex gap-2">
                      <div className="skeleton h-10 w-20"></div>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-10 w-10"></div>
                      ))}
                      <div className="skeleton h-10 w-20"></div>
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