'use client';

import React, { Suspense, useEffect, useCallback } from 'react';
import { SidebarShadcn as Sidebar } from './Sidebar';
import { TopBarShadcn as TopBar } from './TopBar';
import { useAuthContext } from '../providers/AuthProvider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentPage, setMobileOpen } from '@/store/features/dashboard/dashboardSlice';
import { PageType } from '../utils/types';

// Lazy load pages
const ArticlesPage = React.lazy(() => import('../pages/ArticlesPage').then(module => ({ default: module.ArticlesPage })));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const ModerationPage = React.lazy(() => import('../pages/ModerationPage').then(module => ({ default: module.ModerationPage })));
const SubscriptionsPage = React.lazy(() => import('../pages/SubscriptionsPage').then(module => ({ default: module.SubscriptionsPage })));
const WalletPage = React.lazy(() => import('../pages/WalletPage').then(module => ({ default: module.WalletPage })));

interface DashboardLayoutProps {
  title: string;
  children?: React.ReactNode;
}

const getPageFromHash = (): PageType => {
  if (typeof window === 'undefined') {
    return 'profile';
  }
  const hash = window.location.hash.replace('#', '') as PageType;
  const validPages: PageType[] = ['profile', 'articles', 'subscriptions', 'wallet', 'moderation', 'settings'];
  if (validPages.includes(hash)) {
    return hash;
  }
  return 'profile';
};

export const DashboardLayoutShadcn: React.FC<DashboardLayoutProps> = ({ title }) => {
  const dispatch = useAppDispatch();
  const { currentPage, mobileOpen } = useAppSelector((state) => state.dashboard);
  const { loading, error } = useAuthContext();

  const handleMobileOpenChange = useCallback((open: boolean) => {
    dispatch(setMobileOpen(open));
  }, [dispatch]);

  // Sync hash with Redux state on mount and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      dispatch(setCurrentPage(getPageFromHash()));
    };

    // Initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [dispatch]);

  const LoadingFallback = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
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
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'wallet':
        return <WalletPage />;
      case 'settings':
        return <SettingsPage />;
      case 'moderation':
        return <ModerationPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sheet open={mobileOpen} onOpenChange={handleMobileOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Navigation</SheetTitle>
            <SheetDescription>Main navigation for the dashboard.</SheetDescription>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

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
                <Suspense fallback={<LoadingFallback />}>
                  {renderPage()}
                </Suspense>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
