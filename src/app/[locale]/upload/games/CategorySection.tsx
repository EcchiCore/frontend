
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

  // Filter to only show h-game as requested
  const filteredCategories = availableCategories.filter(c => c.toLowerCase() === 'h-game');
  // If h-game isn't in availableCategories for some reason, ensure we show at least it if that's the requirement
  const categoriesToShow = filteredCategories.length > 0 ? filteredCategories : ['h-game'];

  const handleCategoryChange = (category: string) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    dispatch(updateFormData({ categories: newCategories }));
  };

  return (
    <div className="flex flex-wrap gap-3 pt-1">
      {categoriesToShow.map(category => {
        const isActive = formData.categories?.includes(category);
        return (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`text-[13px] font-bold px-5 py-2 rounded-[6px] border-2 transition-all duration-300 ${
              isActive 
                ? 'border-red-600 bg-red-600/10 text-white shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                : 'border-[#1a1a1a] bg-[#111] text-[#444] hover:border-[#333] hover:text-[#888]'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
