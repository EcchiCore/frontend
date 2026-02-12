import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Global configuration for the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                    Settings configuration coming soon...
                </div>
            </CardContent>
        </Card>
    );
}
