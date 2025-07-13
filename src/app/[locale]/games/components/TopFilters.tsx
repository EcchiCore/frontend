// TopFiltersDaisy.tsx  (optional drop-in)
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, Hash, X } from 'lucide-react';

export default function TopFiltersDaisy({ categories, tags, platforms }: any) {
  const t = useTranslations('SearchFilters');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [code, setCode] = useState(searchParams.get('code') || '');

  const update = useCallback(
    (key: string, val: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (val) p.set(key, val);
      else p.delete(key);
      p.delete('page');
      router.replace(`/games?${p.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <label className="input input-bordered flex items-center gap-2">
            <Search className="w-4 h-4" />
            <input
              placeholder={t('searchGame')}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                update('q', e.target.value);
              }}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <input
              placeholder={t('sequentialCode')}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                update('code', e.target.value);
              }}
            />
          </label>
          <select
            className="select select-bordered"
            value={searchParams.get('category') || ''}
            onChange={(e) => update('category', e.target.value || null)}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="select select-bordered"
            value={searchParams.get('tag') || ''}
            onChange={(e) => update('tag', e.target.value || null)}
          >
            <option value="">{t('allTags')}</option>
            {tags.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            className="select select-bordered"
            value={searchParams.get('platform') || ''}
            onChange={(e) => update('platform', e.target.value || null)}
          >
            <option value="">{t('allPlatforms')}</option>
            {platforms.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {searchParams.toString() && (
          <div className="flex justify-end mt-2">
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/games')}>
              <X className="w-4 h-4" /> {t('clearAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}