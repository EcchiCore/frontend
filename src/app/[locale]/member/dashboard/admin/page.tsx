'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { UserManagementTab } from './tabs/UserManagementTab';
import { ContentManagementTab } from './tabs/ContentManagementTab';
import { SubscriptionPlansTab } from './tabs/SubscriptionPlansTab';
import { SponsoredArticlesTab } from './tabs/SponsoredArticlesTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AdminGuard } from './components/AdminGuard';

export default function AdminDashboard() {
    return (
        <AdminGuard>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                        <p className="text-muted-foreground">Manage your application, users, and content.</p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="sponsored">Sponsored</TabsTrigger>
                        <TabsTrigger value="finance">Finance</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <OverviewTab />
                    </TabsContent>
                    <TabsContent value="users" className="space-y-4">
                        <UserManagementTab />
                    </TabsContent>
                    <TabsContent value="content" className="space-y-4">
                        <ContentManagementTab />
                    </TabsContent>
                    <TabsContent value="sponsored" className="space-y-4">
                        <SponsoredArticlesTab />
                    </TabsContent>
                    <TabsContent value="finance" className="space-y-4">
                        <SubscriptionPlansTab />
                    </TabsContent>
                    <TabsContent value="settings" className="space-y-4">
                        <SettingsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminGuard>
    );
}
