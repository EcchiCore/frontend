'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Check, AlertCircle, Wallet, MoreVertical, Edit, Trash } from 'lucide-react';
import { listSubscriptionPlans, createSubscriptionPlan } from '@/lib/subscriptions';
import { type SubscriptionPlan } from '@chanomhub/sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function SubscriptionPlansTab() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Create Plan Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlan, setNewPlan] = useState({
        planId: '',
        name: '',
        description: '',
        pointsCost: 0,
        durationDays: 30,
        roleId: 1, // Default role ID
        isActive: true
    });
    const [creating, setCreating] = useState(false);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const data = await listSubscriptionPlans();
            setPlans(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            setError(null);

            await createSubscriptionPlan(newPlan);

            setSuccess('Subscription plan created successfully');
            setShowCreateModal(false);
            setNewPlan({
                planId: '',
                name: '',
                description: '',
                pointsCost: 0,
                durationDays: 30,
                roleId: 1,
                isActive: true
            });
            fetchPlans();

            // Log success message and clear it after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to create subscription plan');
        } finally {
            setCreating(false);
        }
    };

    if (loading && plans.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight">Subscription Plans</h3>
                    <p className="text-muted-foreground">Manage subscription plans available for users.</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Subscription Plan</DialogTitle>
                            <DialogDescription>
                                Add a new subscription plan to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreatePlan}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="planId" className="text-right">ID</Label>
                                    <Input
                                        id="planId"
                                        value={newPlan.planId}
                                        onChange={(e) => setNewPlan({ ...newPlan, planId: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input
                                        id="name"
                                        value={newPlan.name}
                                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newPlan.description}
                                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="pointsCost" className="text-right">Cost (Points)</Label>
                                    <Input
                                        id="pointsCost"
                                        type="number"
                                        value={newPlan.pointsCost}
                                        onChange={(e) => setNewPlan({ ...newPlan, pointsCost: parseInt(e.target.value) || 0 })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="durationDays" className="text-right">Duration (Days)</Label>
                                    <Input
                                        id="durationDays"
                                        type="number"
                                        value={newPlan.durationDays}
                                        onChange={(e) => setNewPlan({ ...newPlan, durationDays: parseInt(e.target.value) || 30 })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="roleId" className="text-right">Role ID</Label>
                                    <Input
                                        id="roleId"
                                        type="number"
                                        value={newPlan.roleId}
                                        onChange={(e) => setNewPlan({ ...newPlan, roleId: parseInt(e.target.value) || 1 })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Plan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>
                        List of all available subscription plans.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No subscription plans found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.planId}>
                                        <TableCell className="font-medium">{plan.planId}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{plan.name}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{plan.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="flex w-fit items-center gap-1">
                                                <Wallet className="h-3 w-3" />
                                                {plan.pointsCost} Points
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{plan.durationDays} Days</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
