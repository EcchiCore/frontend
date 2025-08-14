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

  // Use searchParams from Next.js navigation hook as the source of truth
  const [tag, setTag] = useState<string>('');
  const [pageSize, setPageSize] = useState<string>('12');

  useEffect(() => {
    setTag(sp.get('tag') ?? '');
    setPageSize(sp.get('pageSize') ?? '12');
  }, [sp]);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      // Reset to first page if filters change
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="ค้นหาตามแท็ก..."
        className="md:col-span-3 px-4 py-2 rounded-2xl border"
      />
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(e.target.value);
          update({ pageSize: e.target.value });
        }}
        className="px-4 py-2 rounded-2xl border"
      >
        {[12, 24, 36, 48].map((n) => (
          <option key={n} value={n}>{n} ต่อหน้า</option>
        ))}
      </select>
      <button onClick={() => update({ tag })} className="px-4 py-2 rounded-2xl border">ค้นหา</button>
    </div>
  );
}