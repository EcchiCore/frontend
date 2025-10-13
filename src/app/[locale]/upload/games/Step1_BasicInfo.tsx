'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), { 
  ssr: false, 
  loading: () => <p>Loading editor...</p> 
});

const engines = ["RENPY", "RPGM", "UNITY", "UNREAL", "Godot", "TyranoBuilder", "WOLFRPG", "KIRIKIRI", "FLASH", "BAKINPLAYER"];
const platforms = ["Windows", "macOS", "Linux", "Android", "iOS", "Web"];

interface Step1_BasicInfoProps {
  formData: Record<string, any>;
  setFormData: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const Step1_BasicInfo = ({ formData, setFormData }: Step1_BasicInfoProps) => {
  const handleChange = (e: { target: { id: string; value: string } }) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleBodyChange = (html: string) => {
    setFormData(prev => ({ ...prev, body: html }));
  };

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => {
      const currentPlatforms = prev.platforms || [];
      const newPlatforms = currentPlatforms.includes(platform)
        ? currentPlatforms.filter((p: string) => p !== platform)
        : [...currentPlatforms, platform];
      return { ...prev, platforms: newPlatforms };
    });
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Game Title</Label>
          <Input id="title" value={formData.title || ''} onChange={handleChange} placeholder="Enter your game's title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="creator">Creator / Studio</Label>
          <Input id="creator" value={formData.creator || ''} onChange={handleChange} placeholder="Enter the creator or studio" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input id="version" value={formData.version || ''} onChange={handleChange} placeholder="e.g., 1.0.0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea id="description" value={formData.description || ''} onChange={handleChange} placeholder="A brief summary of your game" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Full Description</Label>
        <RichTextEditor content={formData.body || ''} onUpdate={handleBodyChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="engine">Game Engine</Label>
          <Input
            id="engine"
            value={formData.engine || ''}
            onChange={handleChange}
            placeholder="Select or type an engine"
            required
            list="engine-list"
          />
          <datalist id="engine-list">
            {engines.map(engine => (
              <option key={engine} value={engine} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label>Platforms</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md">
            {platforms.map(platform => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox id={platform} checked={formData.platforms?.includes(platform)} onCheckedChange={() => handlePlatformChange(platform)} />
                <Label htmlFor={platform}>{platform}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};