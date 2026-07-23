'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { SidebarShadcn as Sidebar } from './Sidebar';
import { TopBarShadcn as TopBar } from './TopBar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMobileOpen } from '@/store/features/dashboard/dashboardSlice';

interface DashboardLayoutProps {
  title?: string;
  children?: React.ReactNode;
}

export const DashboardLayoutShadcn: React.FC<DashboardLayoutProps> = ({ title = 'Dashboard', children }) => {
  const dispatch = useAppDispatch();
  const { mobileOpen } = useAppSelector((state) => state.dashboard);
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  const handleMobileOpenChange = useCallback((open: boolean) => {
    dispatch(setMobileOpen(open));
  }, [dispatch]);

  // Mark as mounted (client-only) to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
