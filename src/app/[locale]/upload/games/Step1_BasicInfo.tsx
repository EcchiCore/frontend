
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData } from '@/store/features/upload/uploadSlice';
import { getSdk } from '@/lib/sdk';
import { Loader2, CheckCircle2, Type, FileText, User, Hash } from 'lucide-react';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <p className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Loading editor...</p>
});

export const Step1_BasicInfo = () => {
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
    
    // Restore: Reset slug when title changes to trigger re-reservation
    if (id === 'title') {
      dispatch(updateFormData({ slug: undefined }));
    }
  };

  const handleBodyChange = (html: string) => {
    dispatch(updateFormData({ body: html }));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider flex items-center gap-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input 
          id="title" 
          type="text"
          value={formData.title || ''} 
          onChange={handleChange} 
          placeholder="e.g. Echoes of Abyss" 
          className="w-full bg-[#141414] border border-[#333] rounded-[4px] text-white text-[14px] px-4 py-2.5 outline-none focus:border-red-500/50 focus:bg-[#1a1a1a] transition-all placeholder:text-[#444]"
          required 
        />
      </div>

      {/* Project URL */}
      <div className="space-y-2">
        <label htmlFor="slug" className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider flex items-center gap-1">
          Project URL <span className="text-red-500">*</span>
          <em className="not-italic text-[#555] lowercase font-normal ml-2">— generated from title</em>
        </label>
        <div className="flex items-stretch group">
          <div className="flex items-center px-4 bg-[#1a1a1a] border border-r-0 border-[#333] group-focus-within:border-red-500/30 rounded-l-[4px] text-[#666] text-[12px] font-mono whitespace-nowrap transition-all">
            chanomhub.com/
          </div>
          <div className="relative flex-1">
            <input 
              id="slug" 
              type="text"
              value={formData.slug || ''} 
              onChange={handleChange} 
              placeholder="url-slug" 
              className="w-full rounded-r-[4px] bg-[#141414] border border-[#333] text-red-400 font-mono text-[14px] px-4 py-2.5 outline-none focus:border-red-500/50 transition-all placeholder:text-[#444]"
              required 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isReserving && <Loader2 className="h-4 w-4 animate-spin text-red-500/50" />}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider">
          Short description 
          <em className="not-italic text-[#555] lowercase font-normal ml-2">— shown in search results</em>
        </label>
        <input 
          id="description" 
          type="text"
          value={formData.description || ''} 
          onChange={handleChange} 
          placeholder="One sentence about your game" 
          className="w-full bg-[#141414] border border-[#333] rounded-[4px] text-[#eee] text-[14px] px-4 py-2.5 outline-none focus:border-red-500/50 focus:bg-[#1a1a1a] transition-all placeholder:text-[#444]"
        />
      </div>

      {/* Creator & Version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="creator" className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider flex items-center gap-1">
            Creator / Studio <span className="text-red-500">*</span>
          </label>
          <input 
            id="creator" 
            type="text"
            value={formData.creator || ''} 
            onChange={handleChange} 
            placeholder="ShadowForge Studio" 
            className="w-full bg-[#141414] border border-[#333] rounded-[4px] text-[#eee] text-[14px] px-4 py-2.5 outline-none focus:border-red-500/50 focus:bg-[#1a1a1a] transition-all placeholder:text-[#444]"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="ver" className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider">Version</label>
          <input 
            id="ver" 
            type="text"
            value={formData.ver || ''} 
            onChange={handleChange} 
            placeholder="e.g. 1.2.0" 
            className="w-full bg-[#141414] border border-[#333] rounded-[4px] text-[#eee] text-[14px] px-4 py-2.5 outline-none focus:border-red-500/50 focus:bg-[#1a1a1a] transition-all font-mono placeholder:text-[#444]"
          />
        </div>
      </div>

      {/* Details / Full Content */}
      <div className="space-y-2 pt-2">
        <label htmlFor="body" className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider flex items-center gap-1">
          Full description <span className="text-red-500">*</span>
          <em className="not-italic text-[#555] lowercase font-normal ml-2">— HTML supported</em>
        </label>
        <div className="bg-[#141414] border border-[#333] rounded-[4px] overflow-hidden min-h-[300px] focus-within:border-red-500/50 transition-all">
          <RichTextEditor content={formData.body || ''} onUpdate={handleBodyChange} />
        </div>
      </div>
    </div>
  );
};
