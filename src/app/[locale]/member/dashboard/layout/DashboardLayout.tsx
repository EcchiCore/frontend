'use client';

import React from 'react';
import { SidebarShadcn as Sidebar } from './Sidebar';
import { TopBarShadcn as TopBar } from './TopBar';
import { useDashboard } from '../providers/DashboardProvider';
import { useAuthContext } from '../providers/AuthProvider';
import { ArticlesPage } from '../pages/ArticlesPage';
import { ProfilePage } from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import { ModerationPage } from '../pages/ModerationPage';
import { SubscriptionsPage } from '../pages/SubscriptionsPage';
import { WalletPage } from '../pages/WalletPage';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface DashboardLayoutProps {
  title: string;
  children?: React.ReactNode;
}

export const DashboardLayoutShadcn: React.FC<DashboardLayoutProps> = ({ title }) => {
  const { currentPage, mobileOpen, setMobileOpen } = useDashboard();
  const { loading, error } = useAuthContext();

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
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
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
                {renderPage()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
