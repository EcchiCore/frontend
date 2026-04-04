
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { engines, platforms } from '@/lib/gameData';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData } from '@/store/features/upload/uploadSlice';
import { Sparkles, Plus, Search, X } from 'lucide-react';

interface TagSectionProps {
  availableTags: string[];
}

export const TagSection = ({ availableTags }: TagSectionProps) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);
  const [newTag, setNewTag] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const handleTagChange = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    dispatch(updateFormData({ tags: newTags }));
  };

  const handleAddManualTag = async () => {
    if (!newTag) return;
    const tagsToAdd = newTag.split(/[\n,]+/).map(t => t.trim()).filter(t => t.length > 0);
    if (tagsToAdd.length === 0) return;

    const validTags: string[] = [];
    for (const tag of tagsToAdd) {
      const isReserved = [...platforms, ...engines].some(r => r.toLowerCase() === tag.toLowerCase());
      if (isReserved) {
        toast.error(`"${tag}" is a Platform/Engine.`);
        continue;
      }
      const knownTag = availableTags.find(t => t.toLowerCase() === tag.toLowerCase());
      validTags.push(knownTag || tag);
    }

    const currentTags = formData.tags || [];
    const newTags = Array.from(new Set([...currentTags, ...validTags]));
    dispatch(updateFormData({ tags: newTags }));
    setNewTag('');
  };

  const handleSuggestTags = async () => {
    if (!formData.title && !formData.description) {
      toast.error("Provide Title or Description for AI suggestions.");
      return;
    }
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/ai/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          engine: formData.engine,
          platforms: formData.platforms,
          availableTags: availableTags,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestedTags(data.suggestions);
        toast.success("Tags suggested!");
      }
    } catch (error) {
      toast.error("Failed to suggest tags");
    } finally {
      setIsSuggesting(false);
    }
  };

  const allDisplayTags = Array.from(new Set([...availableTags, ...(formData.tags || [])]))
    .filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .slice(0, 50); // Limit to 50 for performance

  return (
    <div className="space-y-4 pt-1">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search or type a tag, press Enter to add"
        value={newTag}
        onChange={(e) => {
          setNewTag(e.target.value);
          setTagSearch(e.target.value);
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleAddManualTag()}
        className="w-full bg-[#141414] border border-[#222] rounded-[4px] text-[#aaa] text-[11px] px-3 py-1.5 outline-none focus:border-[#2d2d2d] transition-all"
      />

      {/* Selected Tags Chips */}
      {formData.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formData.tags.map((tag: string) => (
            <button 
              key={tag} 
              onClick={() => handleTagChange(tag)}
              className="text-[11px] px-2.5 py-1 rounded-[3px] border border-[#cc2f3550] bg-[#cc2f3512] text-[#cc7a7d] flex items-center gap-1.5 hover:border-[#cc2f3580] transition-all"
            >
              {tag}
              <span className="opacity-40 text-[9px]">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Suggested & Browse Section */}
      <div className="space-y-3 pt-2">
        {suggestedTags.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider font-bold">Suggested</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTags.filter(t => !formData.tags?.includes(t)).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className="text-[11px] px-2 py-0.5 rounded-[3px] border border-[#252525] bg-transparent text-[#555] hover:border-[#3d3d3d] hover:text-[#999] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider font-bold">Browse All</p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#252525]">
            {allDisplayTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`text-[11px] px-2 py-0.5 rounded-[3px] border transition-all ${
                  formData.tags?.includes(tag)
                    ? 'border-[#cc2f3550] bg-[#cc2f3512] text-[#cc7a7d]'
                    : 'border-[#252525] bg-transparent text-[#444] hover:border-[#333] hover:text-[#777]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
