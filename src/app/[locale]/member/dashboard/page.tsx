'use client';

import React from 'react';
import { DashboardProvider } from './providers/DashboardProvider';
import { AuthProvider } from './providers/AuthProvider';
import { DashboardLayoutShadcn as DashboardLayout } from './layout/DashboardLayout';
import Dashboard from './components/Dashboard';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <DashboardLayout title="Dashboard" />
      </DashboardProvider>
    </AuthProvider>
  );
}