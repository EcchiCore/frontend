
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData, incrementOngoingUploads, decrementOngoingUploads } from '@/store/features/upload/uploadSlice';
import { ImagePlus, X, Loader2, Images } from 'lucide-react';
import { getSdk } from '@/lib/sdk';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

export const MediaGallery = () => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const images = Array.isArray(formData.otherImages) ? formData.otherImages : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    try {
      const sdk = await getSdk();
      const uploadPromises = files.map(async (file) => {
        dispatch(incrementOngoingUploads());
        try {
          const result = await sdk.storage.upload(file, { 
            bucket: 'images',
            game: formData.slug || 'temp'
          });
          
          if (!result || (!result.url && !result.full_url)) {
            throw new Error('Upload failed');
          }
          
          return result.full_url || result.url;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          return null;
        } finally {
          dispatch(decrementOngoingUploads());
        }
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => !!url);
      
      if (validUrls.length > 0) {
        dispatch(updateFormData({ 
          otherImages: [...images, ...validUrls] 
        }));
      }
    } catch (err) {
      console.error('Upload gallery error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    dispatch(updateFormData({ otherImages: newImages }));
  };

  const getDisplayUrl = (url: string) => {
    return getImageUrl(url, 'gallery') || url;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
            <Images className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Screenshots & Gallery</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2 border-white/10 bg-white/5 hover:bg-white/10"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Add Screenshots
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5">
            {url && (
              <Image 
                src={getDisplayUrl(url)} 
                alt={`Screenshot ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleRemove(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">Add More</span>
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
        multiple
      />
    </div>
  );
};
