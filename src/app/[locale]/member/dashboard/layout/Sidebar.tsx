'use client';

import React from 'react';
import { User, FileText, Shield, Settings, Wallet, Activity, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/constants/dashboard';
import { NavigationItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMobileOpen } from '@/store/features/dashboard/dashboardSlice';
import { Link, usePathname } from '@/i18n/navigation';
import { hasRole } from '@/lib/permissions';

const iconMap = {
  LayoutDashboard,
  User,
  FileText,
  Wallet,
  Shield,
  ShieldAlert,
  Settings,
  Activity,
};

const categoryLabels: Record<string, string> = {
  general: 'General',
  creator: 'Creator Hub',
  management: 'Staff Console',
};

interface SidebarProps {
  className?: string;
}

export const SidebarShadcn: React.FC<SidebarProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const hasRequiredRank = (item: NavigationItem): boolean => {
    const required = item.requiredRoles || item.requiredRanks;
    if (!required || !user) return true;
    return hasRole(user, required);
  };

  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const visibleItems = NAVIGATION_ITEMS.filter(hasRequiredRank);

  const categories = ['general', 'creator', 'management'] as const;

  return (
    <div className={`bg-sidebar border-r border-sidebar-border h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex-shrink-0 flex items-center justify-between">
        <Link href="/member/dashboard" className="flex items-center gap-2 font-bold text-base text-sidebar-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm">
            C
          </div>
          <span>ChanomHub</span>
        </Link>
      </div>

      {/* Navigation Menu Categorized */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-6">
        {categories.map((cat) => {
          const items = visibleItems.filter((item) => item.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
                {categoryLabels[cat]}
              </h3>
              {items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.path
                  : pathname.startsWith(item.path);

                return (
                  <Button
                    key={item.id}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start gap-3 px-3 py-2 text-sm transition-colors rounded-lg ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }`}
                    onClick={() => dispatch(setMobileOpen(false))}
                  >
                    <Link href={item.path} prefetch={true}>
                      {getIcon(item.icon as keyof typeof iconMap)}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Info Section */}
      {user && (
        <div className="p-3 border-t border-sidebar-border flex-shrink-0 bg-sidebar-accent/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || ''} alt={user.username || 'User'} />
              <AvatarFallback>{(user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">
                {user.username}
              </p>
              <p className="text-[11px] text-sidebar-foreground/60 truncate">
                {user.rank || user.roles?.[0] || 'Member'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
