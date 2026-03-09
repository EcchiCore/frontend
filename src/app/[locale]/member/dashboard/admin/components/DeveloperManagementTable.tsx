'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CheckCircle2, Clock, User } from 'lucide-react';
import { getSdk } from '@/lib/sdk';
import { toast } from 'react-toastify';

export function DeveloperManagementTable() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const sdk = await getSdk();
            const data = await sdk.developer.getAllProfiles();
            setProfiles(data);
        } catch (error) {
            console.error("Failed to fetch developer profiles:", error);
            toast.error("Failed to load developer profiles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p>Fetching developer database...</p>
            </div>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-500" />
                            Developer Profiles
                        </CardTitle>
                        <CardDescription>
                            Review and manage onboarding information for all creators.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchProfiles}>Refresh</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">User ID</TableHead>
                                <TableHead>Real Name</TableHead>
                                <TableHead>Bank Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Registered</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <p className="italic">No developer profiles registered yet.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profiles.map((profile) => (
                                    <TableRow key={profile.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-xs">#{profile.userId}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{profile.realName}</span>
                                                <span className="text-xs text-muted-foreground">{profile.user?.email || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold uppercase">
                                                        {profile.bankType}
                                                    </Badge>
                                                    <span className="text-sm">{profile.bankName}</span>
                                                </div>
                                                <span className="text-xs font-mono opacity-70">{profile.bankAccount}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {profile.isVerified ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 gap-1 shadow-none">
                                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 shadow-none">
                                                    <Clock className="h-3 w-3" /> Under Review
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(profile.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold"
                                                onClick={() => {
                                                    // This usually triggers a tab change in the parent component
                                                    const moderationTab = document.querySelector('[data-value="moderation"]') as HTMLElement;
                                                    if (moderationTab) moderationTab.click();
                                                    else window.location.search = '?tab=moderation';
                                                }}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
