import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  image: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  label, 
  image, 
  onChange, 
  disabled 
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-base-content font-semibold">{label}</Label>
      <div className="border-2 border-dashed border-base-300 rounded-lg p-6 bg-base-200 hover:bg-base-300 transition-colors">
        <Input
          type="file"
          accept="image/*"
          onChange={onChange}
          disabled={disabled}
          className="hidden"
          id={`upload-${label.toLowerCase().replace(' ', '-')}`}
        />
        <label htmlFor={`upload-${label.toLowerCase().replace(' ', '-')}`} className="flex flex-col items-center gap-2 cursor-pointer">
          <Upload className="w-8 h-8 text-base-content/50" />
          <span className="text-sm text-base-content/70">Click to upload</span>
        </label>
        {image && (
          <div className="mt-4">
            <Image
              src={image}
              alt={label}
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;