'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthHeaders } from '../utils/api';
import { Loader2, DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';

interface ArticleSaleStatDTO {
  id: number;
  title: string;
  slug: string;
  purchasesCount: number;
  earnings: number;
}

interface StudioStatsResponseDTO {
  totalEarnings: number;
  totalPayouts: number;
  currentBalance: number;
  totalSalesCount: number;
  articles: ArticleSaleStatDTO[];
}

export const StudioPage: React.FC = () => {
  const [stats, setStats] = useState<StudioStatsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com';
        const response = await fetch(`${apiUrl}/api/user/studio/stats`, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch studio statistics');
        }

        const json = await response.json();
        const data = json.data || json; // Handle NestJS generic interceptor wrapping

        // Ensure numbers are properly initialized just in case
        setStats({
          ...data,
          totalEarnings: data.totalEarnings || 0,
          totalPayouts: data.totalPayouts || 0,
          currentBalance: data.currentBalance || 0,
          totalSalesCount: data.totalSalesCount || 0,
          articles: data.articles || [],
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Studio Dashboard</h1>
      <p className="text-muted-foreground">Overview of your game sales and earnings.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.currentBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPayouts.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSalesCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">

        {stats.articles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.articles.map((article) => (
              <Card key={article.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-md font-bold truncate pr-2" title={article.title}>
                    {article.title}
                  </CardTitle>
                  <Package className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Purchases: <strong className="text-foreground">{article.purchasesCount}</strong></span>
                    <span>Earnings: <strong className="text-foreground">${article.earnings.toFixed(2)}</strong></span>
                  </div>
                  <div className="mt-4">
                    <a href={`/articles/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                      View Game
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">No games have been sold yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
