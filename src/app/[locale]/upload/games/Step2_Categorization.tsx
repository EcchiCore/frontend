
import { useState } from 'react';
import { toast } from 'sonner';
import { engines, platforms } from '@/lib/gameData';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData } from '@/store/features/upload/uploadSlice';

interface Step2_CategorizationProps {
  availableTags: string[];
  availableCategories: string[];
}

export const Step2_Categorization = ({ availableTags, availableCategories }: Step2_CategorizationProps) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);
  const [newTag, setNewTag] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleTagChange = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    dispatch(updateFormData({ tags: newTags }));
  };

  const handleCategoryChange = (category: string) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    dispatch(updateFormData({ categories: newCategories }));
  };

  const handleAddManualTag = async () => {
    if (!newTag) return;

    const tagsToAdd = newTag
      .split(/[\n,]+/) // Split by newline or comma
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tagsToAdd.length === 0) return;

    // Separate known tags from unknown tags
    const tagsToValidate: string[] = [];
    const validTags: string[] = [];

    for (const tag of tagsToAdd) {
      // Check if tag is a reserved Platform or Engine name
      const isReserved = [...platforms, ...engines].some(
        reserved => reserved.toLowerCase() === tag.toLowerCase()
      );

      if (isReserved) {
        toast.error(`"${tag}" is a Platform/Engine, please select it in Step 1.`);
        continue;
      }

      // Check if already exists in availableTags (case-insensitive)
      const knownTag = availableTags.find(t => t.toLowerCase() === tag.toLowerCase());
      if (knownTag) {
        validTags.push(knownTag);
      } else {
        tagsToValidate.push(tag);
      }
    }

    if (tagsToValidate.length > 0) {
      const toastId = toast.loading(`Validating ${tagsToValidate.length} tags...`);

      try {
        const response = await fetch('/api/ai/validate-tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: tagsToValidate }),
        });

        if (response.ok) {
          const data = await response.json();
          const results = data.results || [];

          results.forEach((result: { tag: string; isValid: boolean; reason?: string }) => {
            if (result.isValid) {
              validTags.push(result.tag);
            } else {
              toast.error(`Tag "${result.tag}" rejected: ${result.reason || "Invalid tag"}`);
            }
          });
        } else {
          console.error("Validation API failed");
          toast.error("Could not validate tags. Please try again.");
        }
      } catch (error) {
        console.error("Validation error", error);
        toast.error("Error validating tags");
      } finally {
        toast.dismiss(toastId);
      }
    }

    if (validTags.length === 0) return;

    const currentTags = formData.tags || [];
    const newTags = [...currentTags];

    validTags.forEach(tagInput => {
      // Check if tag exists in availableTags (case-insensitive) again just in case
      const canonicalTag = availableTags.find(
        t => t.toLowerCase() === tagInput.toLowerCase()
      );

      const tagToUse = canonicalTag || tagInput;

      // Add if not already present
      if (!newTags.includes(tagToUse)) {
        newTags.push(tagToUse);
      }
    });

    dispatch(updateFormData({ tags: newTags }));

    setNewTag('');
  };

  const handleSuggestTags = async () => {
    // Relaxed validation: Check if at least one context field is present
    if (!formData.title && !formData.description && !formData.engine) {
      toast.error("Please provide at least a Title, Description, or Engine in Step 1 for AI suggestions.");
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
        toast.success("Tags suggested successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to suggest tags");
      }
    } catch (error) {
      console.error('Failed to get suggestions', error);
      toast.error("An error occurred while suggesting tags");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Combine available tags with any manually added tags that aren't in the available list
  const allDisplayTags = Array.from(new Set([...availableTags, ...(formData.tags || [])]));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md">
          {availableCategories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category} checked={formData.categories?.includes(category)} onCheckedChange={() => handleCategoryChange(category)} />
              <Label htmlFor={category}>{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Tags</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggestTags}
            disabled={isSuggesting}
          >
            {isSuggesting ? 'Thinking...' : '✨ Suggest Tags with AI'}
          </Button>
        </div>

        {suggestedTags.length > 0 && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-md mb-4">
            <Label className="text-purple-400 mb-2 block">AI Suggestions:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  onClick={() => !formData.tags?.includes(tag) && handleTagChange(tag)}
                  className={formData.tags?.includes(tag) ? 'opacity-50' : ''}
                >
                  {tag} {formData.tags?.includes(tag) && '✓'}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add new tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddManualTag()}
          />
          <Button onClick={handleAddManualTag} type="button">Add</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md max-h-60 overflow-y-auto">
          {allDisplayTags.map(tag => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={tag} checked={formData.tags?.includes(tag)} onCheckedChange={() => handleTagChange(tag)} />
              <Label htmlFor={tag}>{tag}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
