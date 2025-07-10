// MobileMenu.tsx - Fixed version
'use client';

import React from 'react';
import {
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useDashboard } from '../providers/DashboardProvider';
import { useAuthContext } from '../providers/AuthProvider';
import { NAVIGATION_ITEMS } from '../utils/constants';
import { NavigationItem } from '../utils/types';
import Image from 'next/image';
import myImageLoader from "../../../lib/imageLoader";

const iconMap = {
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CogIcon
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const { currentPage, navigateTo } = useDashboard();
  const { user } = useAuthContext();

  const hasRequiredRank = (item: NavigationItem): boolean => {
    if (!item.requiredRanks || !user || !user.rank) return true;
    return item.requiredRanks.includes(user.rank);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  const visibleItems = NAVIGATION_ITEMS.filter(hasRequiredRank);

  return (
    <div className="flex flex-col h-full bg-base-200 border-r border-base-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 min-h-[64px]">
        <h2 className="text-lg font-semibold text-base-content">Dashboard</h2>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-square"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-base-300 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.username}
                    width={40}
                    height={40}
                    loader={myImageLoader}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-base-content truncate">
                {user.username}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {user.rank || 'No rank'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="menu space-y-1">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <button
                className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors
                  ${currentPage === item.id
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-300'
                }`}
                onClick={() => {
                  navigateTo(item.id);
                  onClose();
                }}
              >
                {getIcon(item.icon)}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};