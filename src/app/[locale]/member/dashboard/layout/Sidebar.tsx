'use client';

import React from 'react';
import { User, FileText, Shield, Settings } from 'lucide-react';
import { useDashboard } from '../providers/DashboardProvider';
import { useAuthContext } from '../providers/AuthProvider';
import { NAVIGATION_ITEMS } from '../utils/constants';
import { NavigationItem, PageType } from '../utils/types';
import Image from 'next/image';
import myImageLoader from '@/lib/imageLoader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const iconMap = {
  User,
  FileText,
  Shield,
  Settings,
};

interface SidebarProps {
  className?: string;
}

export const SidebarShadcn: React.FC<SidebarProps> = ({ className = '' }) => {
  const { currentPage, navigateTo } = useDashboard();
  const { user } = useAuthContext();

  const hasRequiredRank = (item: NavigationItem): boolean => {
    if (!item.requiredRanks || !user || !user.rank) return true;
    return item.requiredRanks.includes(user.rank);
  };

  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  const handleNavigation = (pageId: PageType) => {
    navigateTo(pageId);
  };

  const visibleItems = NAVIGATION_ITEMS.filter(hasRequiredRank);

  return (
    <div className={`bg-muted/40 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 text-center border-b flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground">
          Welcome to Dashboard
        </h2>
        {user && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {user.username} ({user.rank || 'No rank'})
          </p>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {visibleItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 text-foreground"
              onClick={() => handleNavigation(item.id)}

            >
              {getIcon(item.icon as keyof typeof iconMap)}
              <span className="font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* User Info Section */}
      {user && (
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.image || undefined} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
