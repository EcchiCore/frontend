// ===============================
// app/games/components/SearchControls.tsx
// ===============================
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function SearchControls() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [queryText, setQueryText] = useState<string>('');
  const pageSize = '12'; // กำหนดตายตัว

  // โหลดค่าจาก URL → queryText
  useEffect(() => {
    const parts: string[] = [];
    const tag = sp.get('tag');
    const category = sp.get('category');
    const platform = sp.get('platform');
    const author = sp.get('author');

    if (tag) parts.push(`tag:${tag}`);
    if (category) parts.push(`category:${category}`);
    if (platform) parts.push(`platform:${platform}`);
    if (author) parts.push(`author:${author}`);

    setQueryText(parts.join(' '));
  }, [sp]);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      params.set('page', '1'); // reset หน้า
      params.set('pageSize', pageSize); // fix pageSize
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp, pageSize]
  );

  // แปลง queryText → object ของ params
  const parseQuery = useCallback(() => {
    const params: Record<string, string | null> = {
      tag: null,
      category: null,
      platform: null,
      author: null,
    };

    queryText.split(/\s+/).forEach((part) => {
      const [key, ...rest] = part.split(':');
      const value = rest.join(':');
      if (params.hasOwnProperty(key)) {
        params[key as keyof typeof params] = value || null;
      }
    });

    update(params);
  }, [queryText, update]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <input
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder="ค้นหา เช่น category:action platform:windows author:jane"
        className="md:col-span-5 px-4 py-2 rounded-2xl border"
      />
      <button 
        onClick={parseQuery} 
        className="px-4 py-2 rounded-2xl border"
      >
        ค้นหา
      </button>
    </div>
  );
}
