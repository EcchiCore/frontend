'use client';

import React from 'react';
import { DashboardProvider } from './providers/DashboardProvider';
import { AuthProvider } from './providers/AuthProvider';
import { DashboardLayout } from './layout/DashboardLayout';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <DashboardLayout title="Dashboard" />
      </DashboardProvider>
    </AuthProvider>
  );
}