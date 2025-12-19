'use client';

import React from 'react';
import { Bell, UserCircle, LogOut, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleMobile } from '@/store/features/dashboard/dashboardSlice';
import { logout } from '@/store/features/auth/authSlice';

interface TopBarProps {
  title: string;
}

export const TopBarShadcn: React.FC<TopBarProps> = ({ title }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      window.location.href = '/login';
    }
  };

  const handleNav = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <header className="bg-primary text-primary-content shadow-md min-h-[64px] px-4 flex items-center">
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleMobile())}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            {title}
          </h1>
          {user && (
            <span className="text-xs sm:text-sm text-primary-content/80">
              {user.rank || 'No rank'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.image || undefined} alt={user?.username || 'User'} />
                <AvatarFallback>
                  {user?.username ? user.username.charAt(0).toUpperCase() : <UserCircle className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNav('profile')}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNav('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};