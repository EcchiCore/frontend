import React from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { DashboardProvider } from './providers/DashboardProvider';

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </AuthProvider>
  );
}
