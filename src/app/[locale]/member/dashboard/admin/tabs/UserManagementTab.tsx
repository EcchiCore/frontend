import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeveloperTokenGenerator } from '../components/DeveloperTokenGenerator';
import { DeveloperManagementTable } from '../components/DeveloperManagementTable';

export function UserManagementTab() {
    return (
        <div className="space-y-6">
            <DeveloperTokenGenerator />

            <DeveloperManagementTable />
        </div>
    );
}
