'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const engines = ["RENPY", "RPGM", "UNITY", "UNREAL", "Godot", "TyranoBuilder", "WOLFRPG", "KIRIKIRI", "FLASH", "BAKINPLAYER"];
const platforms = ["Windows", "macOS", "Linux", "Android", "iOS", "Web"];

interface Step1_BasicInfoProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export const Step1_BasicInfo = ({ formData, setFormData }: Step1_BasicInfoProps) => {
  const handleChange = (e: { target: { id: string; value: string } }) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  }

  const handlePlatformChange = (platform: string) => {
    const currentPlatforms = formData.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter((p: string) => p !== platform)
      : [...currentPlatforms, platform];
    setFormData({ ...formData, platforms: newPlatforms });
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Game Title</Label>
          <Input id="title" value={formData.title || ''} onChange={handleChange} placeholder="Enter your game's title" required />
        </div>
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
        <Textarea id="body" value={formData.body || ''} onChange={handleChange} placeholder="Tell us all about your game." rows={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="engine">Game Engine</Label>
          <Select onValueChange={(value) => handleSelectChange('engine', value)} value={formData.engine || ''} required>
            <SelectTrigger>
              <SelectValue placeholder="Select an engine" />
            </SelectTrigger>
            <SelectContent>
              {engines.map(engine => (
                <SelectItem key={engine} value={engine}>{engine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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