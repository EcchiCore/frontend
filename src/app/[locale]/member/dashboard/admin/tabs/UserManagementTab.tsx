import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeveloperTokenGenerator } from '@/components/features/admin/DeveloperTokenGenerator';
import { DeveloperManagementTable } from '@/components/features/admin/DeveloperManagementTable';

export function UserManagementTab() {
    return (
        <div className="space-y-6">
            <DeveloperTokenGenerator />

            <DeveloperManagementTable />
        </div>
    );
}
