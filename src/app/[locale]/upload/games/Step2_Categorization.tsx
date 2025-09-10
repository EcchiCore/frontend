
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Step2_CategorizationProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  availableTags: string[];
  availableCategories: string[];
}

export const Step2_Categorization = ({ formData, setFormData, availableTags, availableCategories }: Step2_CategorizationProps) => {
  const handleTagChange = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const handleCategoryChange = (category: string) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    setFormData({ ...formData, categories: newCategories });
  };

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
        <Label>Tags</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md">
          {availableTags.map(tag => (
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
