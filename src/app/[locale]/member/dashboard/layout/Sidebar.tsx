'use client';

import React from 'react';
import { User, FileText, Shield, Settings, Wallet, Activity } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/constants/dashboard';
import { NavigationItem, PageType } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentPage, setMobileOpen } from '@/store/features/dashboard/dashboardSlice';

const iconMap = {
  User,
  FileText,
  Wallet,
  Shield,
  Settings,
  Activity,
};

interface SidebarProps {
  className?: string;
}

export const SidebarShadcn: React.FC<SidebarProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((state) => state.dashboard.currentPage);
  const user = useAppSelector((state) => state.auth.user);

  const hasRequiredRank = (item: NavigationItem): boolean => {
    if (!item.requiredRanks || !user) return true;

    const userRanks = [
      ...(user.rank ? [user.rank] : []),
      ...(user.roles || [])
    ].map(r => r.toUpperCase());

    return item.requiredRanks.some(requiredRank =>
      userRanks.includes(requiredRank.toUpperCase())
    );
  };

  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  const handleNavigation = (pageId: PageType) => {
    window.location.hash = pageId;
    dispatch(setCurrentPage(pageId));
    dispatch(setMobileOpen(false));
  };

  const visibleItems = NAVIGATION_ITEMS.filter(hasRequiredRank);

  return (
    <div className={`bg-sidebar border-r border-sidebar-border h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 text-center border-b border-sidebar-border flex-shrink-0">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Welcome to Dashboard
        </h2>
        {user && (
          <p className="text-sm text-sidebar-foreground/70 mt-1 truncate">
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
              variant="ghost"
              className={`w-full justify-start gap-3 transition-colors ${currentPage === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`}
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
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.image || ""} alt={user.username || "User"} />
              <AvatarFallback>{(user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {user.username}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
