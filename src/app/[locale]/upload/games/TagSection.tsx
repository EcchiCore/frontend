
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
  const [isExpanded, setIsExpanded] = useState(false);

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
    .filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()));

  const initialTagLimit = 30;
  const hasMoreTags = allDisplayTags.length > initialTagLimit;
  const visibleTags = isExpanded ? allDisplayTags : allDisplayTags.slice(0, initialTagLimit);

  return (
    <div className="space-y-6 pt-1">
      {/* Selected Tags Chips - Moved to top for focus */}
      {(formData.tags?.length ?? 0) > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] text-[#555] font-bold uppercase tracking-[0.1em]">Selected Tags ({formData.tags?.length})</p>
          <div className="flex flex-wrap gap-2 p-4 bg-[#141414] border border-[#222] rounded-[8px]">
            {formData.tags?.map((tag: string) => (
              <button 
                key={tag} 
                onClick={() => handleTagChange(tag)}
                className="text-[13px] font-bold px-3.5 py-1.5 rounded-[6px] border-2 border-red-600/30 bg-red-600/10 text-white flex items-center gap-2 hover:bg-red-600/20 hover:border-red-600/50 transition-all shadow-lg shadow-red-900/10 animate-in fade-in zoom-in duration-200"
              >
                {tag}
                <X className="h-3.5 w-3.5 text-red-400 group-hover:text-white" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed border-[#1a1a1a] rounded-[8px] text-center">
          <p className="text-[12px] text-[#444] font-medium italic">No tags selected yet</p>
        </div>
      )}

      {/* Search & Add Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444] group-focus-within:text-red-500/50 transition-colors" />
        <input
          type="text"
          placeholder="Search or type a new tag and press Enter..."
          value={newTag}
          onChange={(e) => {
            setNewTag(e.target.value);
            setTagSearch(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddManualTag()}
          className="w-full bg-[#111] border-2 border-[#1a1a1a] rounded-[8px] text-white text-[14px] pl-11 pr-4 py-3 outline-none focus:border-red-600/50 focus:bg-[#141414] transition-all placeholder:text-[#333]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
           <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleAddManualTag}
            className="h-8 px-3 text-[11px] font-bold text-[#666] hover:text-white hover:bg-red-600/20"
           >
             <Plus className="h-3.5 w-3.5 mr-1" /> Add
           </Button>
        </div>
      </div>

      {/* Suggested & Browse Section */}
      <div className="space-y-8 pt-2">
        {suggestedTags.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] text-[#555] font-bold uppercase tracking-[0.15em] flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-red-500" />
              AI Suggestions
            </p>
            <div className="flex flex-wrap gap-2 p-5 bg-[#0c0c0c] border border-[#1a1a1a] rounded-[10px]">
              {suggestedTags.filter(t => !formData.tags?.includes(t)).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className="text-[12px] font-bold px-4 py-2 rounded-[6px] border border-[#222] bg-[#141414] text-[#888] hover:border-red-600/40 hover:text-white hover:bg-red-600/5 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#555] font-bold uppercase tracking-[0.15em]">Browse Tags</p>
            {hasMoreTags && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                {isExpanded ? 'Show Less' : `Show All (${allDisplayTags.length})`}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 p-5 bg-[#0c0c0c] border border-[#1a1a1a] rounded-[10px]">
            {visibleTags.filter(t => !formData.tags?.includes(t)).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className="text-[12px] font-bold px-4 py-2 rounded-[6px] border border-[#222] bg-[#141414] text-[#666] hover:border-red-600/30 hover:text-white hover:bg-red-600/5 transition-all"
              >
                {tag}
              </button>
            ))}
            {!isExpanded && hasMoreTags && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-[12px] font-bold px-4 py-2 rounded-[6px] border border-dashed border-[#222] bg-transparent text-[#444] hover:text-[#666] hover:border-[#333] transition-all"
              >
                + {allDisplayTags.length - initialTagLimit} more tags...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
