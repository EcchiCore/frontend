// TopBar.tsx - Fixed version
'use client';

import React from 'react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useDashboard } from '../providers/DashboardProvider';
import { useAuthContext } from '../providers/AuthProvider';
import Image from 'next/image';
import myImageLoader from "../../../lib/imageLoader";

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { toggleMobile } = useDashboard();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="navbar bg-primary text-primary-content shadow-lg min-h-[64px] px-4">
      {/* Mobile Menu Button */}
      <div className="flex-none lg:hidden">
        <button
          className="btn btn-square btn-ghost btn-sm"
          onClick={toggleMobile}
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            {title}
          </h1>
          {user && (
            <span className="text-xs sm:text-sm text-primary-content/70">
              {user.rank || 'No rank'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-none">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <button className="btn btn-ghost btn-circle btn-sm">
            <div className="indicator">
              <BellIcon className="h-5 w-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm avatar">
              <div className="w-8 h-8 rounded-full bg-primary-content/20 flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.username || 'User'}
                    width={32}
                    height={32}
                    loader={myImageLoader}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6" />
                )}
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
              <li className="menu-title">
                <span className="truncate">{user?.username}</span>
              </li>
              <li>
                <button onClick={() => window.location.hash = 'profile'}>
                  <UserCircleIcon className="h-4 w-4" />
                  Profile
                </button>
              </li>
              <li>
                <button onClick={() => window.location.hash = 'settings'}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};