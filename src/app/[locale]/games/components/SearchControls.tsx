'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function SearchControls() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('');
  const [author, setAuthor] = useState('');

  const pageSize = '12'; // fix ต่อหน้า

  // โหลดค่า URL → state
  useEffect(() => {
    const t = sp.get('tag') ?? '';
    const c = sp.get('category') ?? '';
    const p = sp.get('platform') ?? '';
    const a = sp.get('author') ?? '';

    setCategory(c);
    setPlatform(p);
    setAuthor(a);

    const parts: string[] = [];
    if (t) parts.push(`tag:${t}`);
    if (c) parts.push(`category:${c}`);
    if (p) parts.push(`platform:${p}`);
    if (a) parts.push(`author:${a}`);

    setQueryText(parts.join(' '));
  }, [sp]);

  // update query string
  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      params.set('page', '1');
      params.set('pageSize', pageSize);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  // parse ช่องค้นหารวม → object
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
      if (params.hasOwnProperty(key)) params[key as keyof typeof params] = value || null;
    });

    // sync ช่องแยก
    setCategory(params.category ?? '');
    setPlatform(params.platform ?? '');
    setAuthor(params.author ?? '');

    update(params);
  }, [queryText, update]);

  // sync ช่องแยก → queryText
  const syncQueryText = useCallback(() => {
    const parts: string[] = [];
    if (category) parts.push(`category:${category}`);
    if (platform) parts.push(`platform:${platform}`);
    if (author) parts.push(`author:${author}`);
    setQueryText(parts.join(' '));
  }, [category, platform, author]);

  useEffect(() => {
    syncQueryText();
  }, [category, platform, author, syncQueryText]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      parseQuery();
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ค้นหา เช่น category:action platform:windows author:jane"
              className="pl-10"
            />
          </div>
          <Button onClick={parseQuery}>
            ค้นหา
          </Button>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="หมวดหมู่"
          />
          <Input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="แพลตฟอร์ม"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="ผู้เขียน"
          />
        </div>
      </CardContent>
    </Card>
  );
}