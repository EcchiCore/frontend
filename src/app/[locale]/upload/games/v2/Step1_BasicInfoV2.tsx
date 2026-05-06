
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData } from '@/store/features/upload/uploadSlice';
import { getSdk } from '@/lib/sdk';
import { Loader2, Link2, Type, Quote, FileText } from 'lucide-react';

const PuckEditor = dynamic(() => import('@/components/ui/PuckEditor'), {
  ssr: false,
  loading: () => <p className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Loading block editor...</p>
});

export const Step1_BasicInfoV2 = ({ mode = 'full' }: { mode?: 'full' | 'minimal' | 'editor-only' }) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);
  const [isReserving, setIsReserving] = useState(false);

  const reserveSlug = useCallback(async (title: string) => {
    if (!title || title.length < 3) return;
    setIsReserving(true);
    try {
      const sdk = await getSdk();
      const { slug } = await sdk.articles.reserveSlug(title);
      dispatch(updateFormData({ slug }));
    } catch (error) {
      console.error('Failed to reserve slug:', error);
    } finally {
      setIsReserving(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title && !formData.slug) {
        reserveSlug(formData.title);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.title, formData.slug, reserveSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    dispatch(updateFormData({ [id]: value }));
    if (id === 'title') {
      dispatch(updateFormData({ slug: undefined }));
    }
  };

  const handlePuckChange = (data: any) => {
    dispatch(updateFormData({ puckData: data }));
  };

  if (mode === 'editor-only') {
    return <PuckEditor data={formData.puckData} onChange={handlePuckChange} />;
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <label htmlFor="title" className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <Type className="w-3 h-3 text-red-500" />
          Game Title
        </label>
        <input 
          id="title" 
          type="text"
          value={formData.title || ''} 
          onChange={handleChange} 
          placeholder="What's the name of your masterpiece?" 
          className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-lg font-bold px-6 py-4 outline-none focus:border-red-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
          required 
        />
      </div>

      {/* Project URL */}
      <div className="space-y-3">
        <label htmlFor="slug" className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <Link2 className="w-3 h-3 text-red-500" />
          Web Identifier
        </label>
        <div className="flex items-stretch group">
          <div className="flex items-center px-4 bg-white/5 border border-r-0 border-white/10 group-focus-within:border-red-500/30 rounded-l-xl text-white/20 text-[11px] font-mono whitespace-nowrap transition-all">
            chanomhub.com/
          </div>
          <div className="relative flex-1">
            <input 
              id="slug" 
              type="text"
              value={formData.slug || ''} 
              onChange={handleChange} 
              placeholder="url-slug" 
              className="w-full rounded-r-xl bg-white/5 border border-white/10 text-red-500 font-mono text-sm px-4 py-3.5 outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
              required 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isReserving && <Loader2 className="h-4 w-4 animate-spin text-red-500/50" />}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="space-y-3">
        <label htmlFor="description" className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <Quote className="w-3 h-3 text-red-500" />
          Catchphrase
        </label>
        <textarea 
          id="description" 
          rows={2}
          value={formData.description || ''} 
          onChange={handleChange} 
          placeholder="A single sentence that hooks the players..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-sm px-6 py-4 outline-none focus:border-red-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10 resize-none"
        />
      </div>

      {/* Creator & Version */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label htmlFor="creator" className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-3 h-3 text-red-500" />
            Creator
          </label>
          <input 
            id="creator" 
            type="text"
            value={formData.creator || ''} 
            onChange={handleChange} 
            placeholder="Studio Name" 
            className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-sm px-6 py-3.5 outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
            required
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="ver" className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Build Ver.</label>
          <input 
            id="ver" 
            type="text"
            value={formData.ver || ''} 
            onChange={handleChange} 
            placeholder="1.0.0" 
            className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-sm px-6 py-3.5 outline-none focus:border-red-500/50 transition-all font-mono placeholder:text-white/10"
          />
        </div>
      </div>
    </div>
  );
};
