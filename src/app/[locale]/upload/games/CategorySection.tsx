
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData } from '@/store/features/upload/uploadSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategorySectionProps {
  availableCategories: string[];
}

export const CategorySection = ({ availableCategories }: CategorySectionProps) => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);

  const handleCategoryChange = (category: string) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    dispatch(updateFormData({ categories: newCategories }));
  };

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {availableCategories.map(category => {
        const isActive = formData.categories?.includes(category);
        return (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`text-[11px] px-2.5 py-1 rounded-[3px] border transition-all ${
              isActive 
                ? 'border-[#cc2f3550] bg-[#cc2f3512] text-[#cc7a7d]' 
                : 'border-[#252525] bg-[#171717] text-[#555] hover:border-[#3d3d3d] hover:text-[#999]'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
