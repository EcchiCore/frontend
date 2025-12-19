
'use client';

import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setStep } from '@/store/features/upload/uploadSlice';

const menuItems = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'categorization', label: 'Categorization' },
  { id: 'media', label: 'Media' },
  { id: 'downloads', label: 'Downloads' },
];

export const SideMenu = () => {
  const dispatch = useAppDispatch();
  const activeSection = useAppSelector((state) => state.upload.activeSection);

  return (
    <div className="flex flex-col space-y-2">
      {menuItems.map(item => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? 'secondary' : 'ghost'}
          onClick={() => dispatch(setStep(item.id))}
          className="justify-start"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};
