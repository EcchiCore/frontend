import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UserManagementTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users, roles, and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                    User management features coming soon...
                </div>
            </CardContent>
        </Card>
    );
}
