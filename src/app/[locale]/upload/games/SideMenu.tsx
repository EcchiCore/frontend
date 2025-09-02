
'use client';

import { Button } from '@/components/ui/button';

const menuItems = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'categorization', label: 'Categorization' },
  { id: 'media', label: 'Media' },
  { id: 'downloads', label: 'Downloads' },
];

interface SideMenuProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const SideMenu = ({ activeSection, setActiveSection }: SideMenuProps) => {
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
