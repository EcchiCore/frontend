'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getSdk } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  Globe,
  Settings,
  Type,
  FileCode,
  Loader2,
  RefreshCw,
  Upload
} from 'lucide-react';

const ENGINES = [
  { value: 'all', label: 'All Engines' },
  { value: 'unity', label: 'Unity' },
  { value: 'godot', label: 'Godot' },
  { value: 'unreal', label: 'Unreal Engine' },
  { value: 'renpy', label: 'Ren\'Py' },
  { value: 'other', label: 'Other Engine' },
];

const LANGUAGES = [
  { value: 'all', label: 'All Languages' },
  { value: 'th', label: 'Thai (th)' },
  { value: 'en', label: 'English (en)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'zh', label: 'Chinese (zh)' },
];

export default function FontsCatalogPage() {
  const [search, setSearch] = useState('');
  const [engine, setEngine] = useState('all');
  const [language, setLanguage] = useState('all');
  const [page, setPage] = useState(1);
  const take = 12;

  // SWR fetcher using SDK client
  const fetcher = async () => {
    const sdk = await getSdk();
    const skip = (page - 1) * take;
    return await sdk.fonts.getFonts({
      search: search.trim() || undefined,
      engine: engine !== 'all' ? engine : undefined,
      language: language !== 'all' ? language : undefined,
      skip,
      take,
    });
  };

  const { data, error, isLoading, mutate } = useSWR(
    ['fonts-catalog', search, engine, language, page],
    fetcher,
    { keepPreviousData: true }
  );

  const fonts = data?.fonts || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / take);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-slate-800/80 p-6 md:p-8">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Type size={28} className="text-violet-400" />
                Font Registry
              </h1>
              <p className="text-slate-400 text-sm max-w-lg">
                Discover game-engine compatible font registries and localized assets submitted by the community.
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl gap-1.5"
              onClick={() => window.location.href = '/upload/fonts'}
            >
              <Upload size={16} />
              Register Font
            </Button>
          </div>
        </div>

        {/* Filter controls */}
        <Card className="border-slate-800 bg-[#161616]/60 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search font registries..."
                className="pl-9 bg-slate-900/60 border-slate-800"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={engine} onValueChange={(val) => { setEngine(val); setPage(1); }}>
                <SelectTrigger className="w-[150px] bg-slate-900/60 border-slate-800">
                  <SelectValue placeholder="Engine" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-slate-800">
                  {ENGINES.map(item => (
                    <SelectItem key={item.value} value={item.value} className="focus:bg-violet-600">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={(val) => { setLanguage(val); setPage(1); }}>
                <SelectTrigger className="w-[150px] bg-slate-900/60 border-slate-800">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-slate-800">
                  {LANGUAGES.map(item => (
                    <SelectItem key={item.value} value={item.value} className="focus:bg-violet-600">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="border-slate-800 hover:bg-slate-800 text-slate-400"
                onClick={() => mutate()}
              >
                <RefreshCw size={15} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          </div>
        )}

        {/* Error Card */}
        {error && (
          <Card className="border-rose-950 bg-rose-950/10 p-6 text-center text-rose-400 max-w-md mx-auto">
            <p className="font-semibold mb-2">Failed to load font registries</p>
            <p className="text-xs text-rose-500 mb-4">{error.message || 'Unknown network error'}</p>
            <Button onClick={() => mutate()} className="bg-rose-900/40 hover:bg-rose-800/40 text-white">Retry</Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && fonts.length === 0 && (
          <Card className="border-slate-800 bg-[#161616]/40 p-12 text-center">
            <CardContent className="flex flex-col items-center gap-3">
              <Type size={36} className="text-slate-600" />
              <p className="text-slate-400 font-medium">No approved font registries found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Try adjusting your search criteria, clearing filters, or register the first font compatible with your favorite engine!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Fonts Grid */}
        {!isLoading && !error && fonts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fonts.map((font) => (
              <Card key={font.id} className="border-slate-800/80 bg-[#161616]/60 hover:border-slate-700/60 transition-all flex flex-col justify-between group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                      {font.name}
                    </CardTitle>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/10 text-violet-400 border border-violet-600/15 shrink-0 uppercase">
                      {font.engine}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-slate-500 font-mono">
                    slug: {font.slug}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1">
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Globe size={13} className="text-slate-500" />
                      <span>Language: <strong>{font.language.toUpperCase()}</strong></span>
                    </div>
                    {font.engineVersion && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Settings size={13} className="text-slate-500" />
                        <span>Version: <strong>{font.engineVersion}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Files list */}
                  {font.assets && font.assets.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Files</p>
                      <div className="space-y-1">
                        {font.assets.map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-900/40 border border-slate-800/50">
                            <span className="text-slate-400 truncate max-w-[180px] font-semibold flex items-center gap-1">
                              <FileCode size={12} className="text-slate-500" />
                              {asset.key.split('/').pop()}
                            </span>
                            <a
                              href={asset.url}
                              download
                              className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-0.5 shrink-0"
                            >
                              <Download size={11} />
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No files uploaded yet</p>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500">
                  <span>uploader: {font.uploader?.name || `user #${font.uploaderId}`}</span>
                  <span>{new Date(font.createdAt).toLocaleDateString()}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="border-slate-800"
            >
              Previous
            </Button>
            <div className="text-xs text-slate-500">
              Page <strong className="text-slate-300">{page}</strong> of <strong className="text-slate-300">{totalPages}</strong>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="border-slate-800"
            >
              Next
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
