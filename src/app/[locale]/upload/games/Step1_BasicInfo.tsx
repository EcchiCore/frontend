
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
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-[11px] text-[#555] uppercase tracking-wider">Title</label>
        <input 
          id="title" 
          type="text"
          value={formData.title || ''} 
          onChange={handleChange} 
          placeholder="Echoes of Abyss" 
          className="w-full bg-[#191919] border border-[#252525] rounded-[4px] text-[#ccc] text-[13px] px-3 py-2 outline-none focus:border-[#333] focus:bg-[#1d1d1d] transition-all"
          required 
        />
      </div>

      {/* Project URL */}
      <div className="space-y-1.5">
        <label htmlFor="slug" className="text-[11px] text-[#555] uppercase tracking-wider">URL <em className="not-italic text-[#444] lowercase">— generated from title, editable</em></label>
        <div className="flex items-stretch">
          <div className="flex items-center px-3 bg-[#161616] border border-r-0 border-[#252525] rounded-l-[4px] text-[#3d3d3d] text-[11px] font-mono whitespace-nowrap">
            chanomhub.com/
          </div>
          <div className="relative flex-1">
            <input 
              id="slug" 
              type="text"
              value={formData.slug || ''} 
              onChange={handleChange} 
              placeholder="url-slug" 
              className="w-full rounded-r-[4px] bg-[#191919] border border-[#252525] text-[#5a8fbd] font-mono text-[13px] px-3 py-2 outline-none focus:border-[#333] transition-all"
              required 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isReserving && <Loader2 className="h-4 w-4 animate-spin text-[#333]" />}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-[11px] text-[#555] uppercase tracking-wider">Short description <em className="not-italic text-[#444] lowercase">— shown in search results</em></label>
        <input 
          id="description" 
          type="text"
          value={formData.description || ''} 
          onChange={handleChange} 
          placeholder="One sentence about your game" 
          className="w-full bg-[#191919] border border-[#252525] rounded-[4px] text-[#ccc] text-[13px] px-3 py-2 outline-none focus:border-[#333] focus:bg-[#1d1d1d] transition-all"
        />
      </div>

      {/* Creator & Version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="creator" className="text-[11px] text-[#555] uppercase tracking-wider">Creator / Studio</label>
          <input 
            id="creator" 
            type="text"
            value={formData.creator || ''} 
            onChange={handleChange} 
            placeholder="ShadowForge Studio" 
            className="w-full bg-[#191919] border border-[#252525] rounded-[4px] text-[#ccc] text-[13px] px-3 py-2 outline-none focus:border-[#333] focus:bg-[#1d1d1d] transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ver" className="text-[11px] text-[#555] uppercase tracking-wider">Version</label>
          <input 
            id="ver" 
            type="text"
            value={formData.ver || ''} 
            onChange={handleChange} 
            placeholder="e.g. 1.2.0" 
            className="w-full bg-[#191919] border border-[#252525] rounded-[4px] text-[#ccc] text-[13px] px-3 py-2 outline-none focus:border-[#333] focus:bg-[#1d1d1d] transition-all font-mono"
          />
        </div>
      </div>

      {/* Details / Full Content */}
      <div className="space-y-1.5 pt-2">
        <label htmlFor="body" className="text-[11px] text-[#555] uppercase tracking-wider">Full description <em className="not-italic text-[#444] lowercase">— appears on your game page, HTML ok</em></label>
        <div className="bg-[#191919] border border-[#252525] rounded-[4px] overflow-hidden min-h-[300px] focus-within:border-[#333] transition-all">
          <RichTextEditor content={formData.body || ''} onUpdate={handleBodyChange} />
        </div>
      </div>
    </div>
  );
};
