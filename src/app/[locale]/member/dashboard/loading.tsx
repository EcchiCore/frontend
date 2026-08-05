import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-28 rounded-2xl bg-muted/60" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-muted/70 rounded" />
                <div className="h-7 w-28 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted/50 rounded" />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-muted/70 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="h-5 w-36 bg-muted/80 rounded" />
                <div className="h-4 w-full bg-muted/50 rounded" />
                <div className="h-4 w-2/3 bg-muted/40 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
