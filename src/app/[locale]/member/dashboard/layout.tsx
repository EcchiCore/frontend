'use client';

import React from 'react';
import { DashboardLayoutShadcn as DashboardLayout } from './layout/DashboardLayout';

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
