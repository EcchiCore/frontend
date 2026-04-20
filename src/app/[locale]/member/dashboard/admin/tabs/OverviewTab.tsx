import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSdk } from '@/lib/sdk';
import { Megaphone, Users, DollarSign, Loader2 } from 'lucide-react';
import useSWR from 'swr';

export function OverviewTab() {
    const { data: stats, error, isLoading } = useSWR('admin-overview-stats', async () => {
        const sdk = await getSdk();
        const sponsored = await sdk.sponsoredArticles.getAll({ all: true }).catch(() => []);
        
        return {
            totalRevenue: 0,
            activeUsers: 0,
            sponsoredArticles: sponsored.length,
        };
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 text-destructive">
                Failed to load statistics.
            </div>
        );
    }

    const displayStats = stats || {
        totalRevenue: 0,
        activeUsers: 0,
        sponsoredArticles: 0,
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>System health and quick statistics.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">฿{displayStats.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{displayStats.activeUsers}</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sponsored Articles</CardTitle>
                            <Megaphone className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{displayStats.sponsoredArticles}</div>
                            <p className="text-xs text-muted-foreground">Articles currently promoted</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
