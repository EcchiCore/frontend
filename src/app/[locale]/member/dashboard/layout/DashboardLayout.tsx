// DashboardLayout.tsx - Fixed version
'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileMenu } from './MobileMenu';
import { useDashboard } from '../providers/DashboardProvider';
import { useAuthContext } from '../providers/AuthProvider';
import { ArticlesPage } from '../pages/ArticlesPage';
import { ProfilePage } from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import { ModerationPage } from '../pages/ModerationPage';

interface DashboardLayoutProps {
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title }) => {
  const { currentPage, mobileOpen, setMobileOpen } = useDashboard();
  const { loading, error } = useAuthContext();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render page based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage />;
      case 'articles':
        return <ArticlesPage />;
      case 'settings':
        return <SettingsPage />;
      case 'moderation':
        return <ModerationPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Top Bar */}
          <TopBar title={title} />

          {/* Page Content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-4 sm:py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {renderPage()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};