import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSdk } from '@/lib/sdk';
import { Megaphone, Users, DollarSign, Loader2 } from 'lucide-react';

export function OverviewTab() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeUsers: 0,
        sponsoredArticles: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const sdk = await getSdk();
                const sponsored = await sdk.sponsoredArticles.getAll({ all: true }).catch(() => []);
                
                setStats({
                    totalRevenue: 0,
                    activeUsers: 0,
                    sponsoredArticles: sponsored.length,
                    loading: false
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    if (stats.loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                            <div className="text-2xl font-bold">฿{stats.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeUsers}</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sponsored Articles</CardTitle>
                            <Megaphone className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sponsoredArticles}</div>
                            <p className="text-xs text-muted-foreground">Articles currently promoted</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
