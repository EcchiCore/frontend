
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData, incrementOngoingUploads, decrementOngoingUploads } from '@/store/features/upload/uploadSlice';
import { ImagePlus, X, Loader2, RefreshCw } from 'lucide-react';
import { getSdk } from '@/lib/sdk';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

interface MediaUploadProps {
  id: string;
  label: string;
  description?: string;
  className?: string;
}

export const MediaUpload = ({ id, label, description, className }: MediaUploadProps) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const value = formData[id];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      dispatch(incrementOngoingUploads());
      const sdk = await getSdk();
      const result = await sdk.storage.upload(file, { 
        bucket: 'images',
        game: formData.slug || 'temp'
      });

      if (!result || !result.url) {
        throw new Error('Upload failed');
      }

      // Store the URL (either relative or full) in form data
      dispatch(updateFormData({ [id]: result.url }));
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      dispatch(decrementOngoingUploads());
    }
  };

  const handleRemove = () => {
    dispatch(updateFormData({ [id]: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDisplayUrl = (url: string) => {
    // Resolve through imgproxy to avoid 403 and optimize
    return getImageUrl(url, 'card') || url;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      {!value ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
            transition-colors duration-200 h-full w-full
            ${isUploading ? 'bg-muted/50 border-muted' : 'border-muted-foreground/20 hover:border-primary hover:bg-primary/5'}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground text-center">
                Click to upload or drag and drop
              </p>
              {description && <div className="text-[10px] text-muted-foreground/60 mt-2 text-center whitespace-pre-line">{description}</div>}
            </>
          )}
        </div>
      ) : (
        <div className="relative group rounded-lg overflow-hidden border border-border h-full w-full bg-muted/20">
          <Image 
            src={getDisplayUrl(value)} 
            alt={label || id} 
            fill 
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="icon" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {error && <p className="text-[10px] text-destructive">{error}</p>}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};
