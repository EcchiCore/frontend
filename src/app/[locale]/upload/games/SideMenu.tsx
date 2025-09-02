
'use client';

import { Button } from '@/components/ui/button';

const menuItems = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'categorization', label: 'Categorization' },
  { id: 'media', label: 'Media' },
  { id: 'downloads', label: 'Downloads' },
];

export const SideMenu = ({ activeSection, setActiveSection }) => {
  return (
    <div className="flex flex-col space-y-2">
      {menuItems.map(item => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? 'secondary' : 'ghost'}
          onClick={() => setActiveSection(item.id)}
          className="justify-start"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};
